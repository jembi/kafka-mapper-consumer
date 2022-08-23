export const tables = [
  `CREATE TABLE patient(
        createdAt Date,
        updatedAt Date,
        patientId String,
        patientName String, 
        patientFamilyName String, 
        patientGivenName String

    ) 
    ENGINE=MergeTree
    ORDER BY tuple()`,
  `CREATE TABLE observation(
        createdAt Date,
        observationCode String, 
        observationDateTime DateTime, 
        observationUnit String,
        observationValue String
    ) 
    ENGINE=MergeTree
    ORDER BY tuple()`,
];
