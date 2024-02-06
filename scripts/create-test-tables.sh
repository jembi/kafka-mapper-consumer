curl -v 'http://localhost:8124/' --data-binary @- << EOF
  CREATE TABLE patient(
    id String NULL,
    version String NULL,
    inserted_at DateTime DEFAULT now(),
    last_updated Date NULL,
    createdAt Date,
    updatedAt Date,
    patientId String,
    patientName String, 
    patientFamilyName String, 
    patientGivenName String
  ) 
  ENGINE=MergeTree
  ORDER BY tuple()
EOF

curl -v 'http://localhost:8124/' --data-binary @- << EOF
  CREATE TABLE observation(
    id String NULL,
    version String NULL,
    inserted_at DateTime DEFAULT now(),
    last_updated Date NULL,
    createdAt Date,
    observationCode String, 
    observationDateTime DateTime, 
    observationUnit String,
    observationValue String
  ) 
  ENGINE=MergeTree
  ORDER BY tuple()
EOF
