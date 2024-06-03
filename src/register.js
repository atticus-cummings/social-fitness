import { FormikHelpers, useFormik } from 'formik';
import './Auth.css'

export default function Register(){
  
    const intialValues = {
        email: '',
        password: '',
        first_name: '',
        last_name: '',
      };
    
      const onSubmit = async (
        values,
        { resetForm, setFieldError },
      ) => {        
        fetch('http://localhost:3030/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: values.email, password: values.password,
                 first_name: values.first_name, last_name: values.last_name})
        })
        .then(response => {
            if (response.ok) {
                return response.text(); // or response.json() if server responds with JSON
            }
            throw new Error('Failed to register');
        })
        .then(data => {
            console.log(data); // Handle the success response
            alert('Registration successful');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Registration failed');
        });
        console.log(values.email + values.password)
      };
    
      const formik = useFormik({
        initialValues: intialValues,
        onSubmit,
      });
    return(
        <div className="w-1/2" id="register">
        <div className="justify-center" >
        <form onSubmit={formik.handleSubmit}>
        <div className="col-span-6 sm:col-span-4">
          <div className="mt-2 flex flex-col">
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="first_name"
              placeholder="First Name"
              aria-label="First Name"
              required
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.first_name && formik.errors.first_name ? (
              <div className="mt-2 text-sm text-red-600">
                {formik.errors.first_name}
              </div>
            ) : null}
          </div>
          </div>
          <div className="col-span-6 sm:col-span-4">
          <div className="mt-2 flex flex-col">
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete=""
              placeholder="Last Name"
              aria-label="Last Name"
              required
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.last_name && formik.errors.last_name ? (
              <div className="mt-2 text-sm text-red-600">
                {formik.errors.last_name}
              </div>
            ) : null}
          </div>
        </div>
        <div className="col-span-6 sm:col-span-4">
          <div className="mt-2 flex flex-col">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              aria-label="Email"
              required
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="mt-2 text-sm text-red-600">
                {formik.errors.email}
              </div>
            ) : null}
          </div>
        </div>
        <div className="col-span-6 mt-4 sm:col-span-4">
          <div className="mt-2 flex flex-col">
            <input
              id="password"
              name="password"
              type="password"
              aria-label="Password"
              placeholder="Password"
              autoComplete="current-password"
              required
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="mt-2 text-sm text-red-600">
                {formik.errors.password}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            
            size="large"
            className="w-full"
          >
            Register
          </button>
        </div>
        <div id='switch-to-login'>
          <a href="/login">Click here to Login</a>
        </div>
        <div className="relative mt-8">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-center">

          </div>
        </div>
      </form>
      </div>
      </div>
    )
}