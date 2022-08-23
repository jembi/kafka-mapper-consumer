export const tables = [
  `CREATE TABLE patient(
        createdAt Date,
        updatedAt Date,
        patientId String,
        patientName String, 
        patientFamilyName String, 
        patientGivenName String

    ) 
    ENGINE=MergeTree(createdAt, (patientId, createdAt))
    ORDER BY tuple()`,
  `CREATE TABLE observation(
        createdAt Date,
        observationCode String, 
        observationDateTime DateTime, 
        observationUnit String,
        observationValue String
    ) 
    ENGINE=MergeTree(createdAt, (observationCode, createdAt))
    ORDER BY tuple()`,
];
