export const plugin = (table, entry, tableMapping) => {
  if (table.rows.patient_given_name && table.rows.patient_family_name) {
    table.rows["patient_full_name"] = `${table.rows.patient_given_name} ${table.rows.patient_family_name}`;
  }
  return table;
};
