export const plugin = (tableMapping, entry, table) => {
  if (table.rows.patientGivenName && table.rows.patientFamilyName) {
    table.rows["patientFullName"] = `${table.rows.patientGivenName} ${table.rows.patientFamilyName}`;
  }
  return table;
};
