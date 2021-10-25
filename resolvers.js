const fetch = require('node-fetch');

const {API_URL} = process.env;//'http://localhost:4000/v1';

const Query = {
  async patient(parent, args, context, info) {
    const { id } = args;
    const response = await fetch(`${API_URL}/patient/${id}`);
    const body = await response.json();
    return body;
  },

  // using one-line arrow function syntax here plus destructuring inline
  doctor: async (_, { id }) =>
    fetch(`${API_URL}/doctor/${id}`).then((res) => res.json()),
};

const Patient = {
  async doctors(parent, args, context, info) {
    const { id } = parent;
    const url = `${API_URL}/visit/patient/${id}`;

    const visits = await fetch(url).then((res) => res.json());
    console.log(visits); // observe the shape of the return value

    // GOAL: we want to iterate through the list of visits and use the `doctor_id` to do a
    //  GET /doctors/doctor_id call, and build our array of doctors that the patient has seen

    // since this fetch returns a promise, we end up with an array of Doctor Promises.
    // const arrayOfDoctorPromises = visits.map((v) =>
    //   fetch(`${API_URL}/doctor/${v.doctor_id}`).then((res) => res.json())
    // );

    const { loaders } = context;
    const arrayOfDoctorPromises = visits.map((v) =>
      loaders.doctorLoader.load(v.doctor_id)
    );

    // use `Promise.all` to wait for all those promises to resolve
    // each promise returns the doctor information, so we end up with an array of doctors
    const doctors = await Promise.all(arrayOfDoctorPromises);

    // return the final list of doctors
    return doctors;
  },
};
// we're adding a new resolver for Doctor
const Doctor = {
  patients: async ({ id }) => {
    const visits = await fetch(`${API_URL}/visit/doctor/${id}`).then((res) =>
      res.json()
    );

    return Promise.all(
      visits.map(({ patient_id }) =>
        fetch(`${API_URL}/patient/${patient_id}`).then((res) => res.json())
      )
    );
  },
};

let mockAppointmentsDb = [];

const Mutation = {
  createAppointment: (parent, args, context, info) => {
    const { input } = args;
    const { patient_id, doctor_id, date } = input;

    // Create and save the new Appointment model to our "database"
    const appointmentRecord = {
      id: mockAppointmentsDb.length,
      patient_id,
      doctor_id,
      date,
    };

    mockAppointmentsDb.push(appointmentRecord);

    // Return the new appointment
    return {
      appointment: appointmentRecord,
    };
  },
};

module.exports = {
  Query,
  Patient,
  Doctor,
  Mutation,
};
