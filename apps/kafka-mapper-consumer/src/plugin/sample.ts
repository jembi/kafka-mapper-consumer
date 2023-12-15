export const plugin = (table, entry, tableMapping) => {
  if (table.rows.patientGivenName && table.rows.patientFamilyName) {
    table.rows["patientFullName"] = `${table.rows.patientGivenName} ${table.rows.patientFamilyName}`;
  }
  return table;
};
