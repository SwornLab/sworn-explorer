import { MongoClient } from 'mongodb';
import { MONGO_URI } from '$env/static/private';

let client: MongoClient;

export const connect = async () => {
	if (!client) {
		client = await MongoClient.connect(MONGO_URI);
	}
	return client;
};

export const getDocument = async (hashStr: string) => {
	const client = await connect();
	const db = client.db('unchained');
	const documents = db.collection('attestation');
	const hash = Buffer.from(hashStr, 'hex');
	const document = await documents.findOne({ 'data.hash': hash });
	if (document) {
		const signersCol = db.collection('signer');
		const signers = await signersCol.find({ hash: document.hash }).toArray();
		document.signers = signers.map((signer) => signer.signers).flat();
	}
	return document;
};

export const getSignatures = async () => {
	const client = await connect();
	const db = client.db('unchained');
	const attestationsCol = db.collection('attestation');
	const signers = attestationsCol
		.aggregate([
			{
				$lookup: {
					from: 'signer',
					let: { attestationHash: '$hash' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$hash', '$$attestationHash'] } } },
						{ $project: { signers_count: { $size: '$signers' } } }
					],
					as: 'matchingSigners'
				}
			},
			{ $unwind: { path: '$matchingSigners', preserveNullAndEmptyArrays: true } },
			{
				$project: {
					hash: '$data.hash',
					signers: { $ifNull: ['$matchingSigners.signers_count', 0] }
				}
			}
		])
		.toArray();
	return signers;
};

export const getAttestationsBySigner = async (signer: string) => {
	const client = await connect();
	const db = client.db('unchained');
	const signersCol = db.collection('signer');
	const signers = await signersCol
		.aggregate([
			{ $match: { 'signers.publickey': Buffer.from(signer, 'hex') } },
			{
				$lookup: {
					from: 'attestation',
					localField: 'hash',
					foreignField: 'hash',
					as: 'attestations'
				}
			},
			{ $project: { _id: 0, attestations: 1 } }
		])
		.toArray();

	return signers?.[0]?.attestations;
};
