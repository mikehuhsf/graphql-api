const DataLoader = require('dataloader');
const fetch = require('node-fetch');

const {API_URL} = process.env;//'http://localhost:4000/v1';

const doctorLoader = new DataLoader((ids) => {
  const arrayOfDoctorPromises = ids.map((id) => {
    console.log(`Calling for doctor: ${id}`);
    return fetch(`${API_URL}/doctor/${id}`).then((res) => res.json());
  });
  return Promise.all(arrayOfDoctorPromises);
});

module.exports = {
  getDataLoaders: () => ({
    doctorLoader: doctorLoader,
  }),
};
