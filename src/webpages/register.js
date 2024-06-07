import { FormikHelpers, useFormik } from 'formik';

import {Header} from "../components/header";
import './login.css';
export default function Register({supabase, session, setSession , setHomepageView}){
    const intialValues = {
        email: '',
        password: '',
        first_name: '',
        last_name: '',
      };
      const switchTab = () => {
        //setShowLogin(true);
        setHomepageView('login')
      };
      const onSubmit = async (
        values,
        { resetForm, setFieldError },
      ) => { 
        const { data, error } = await supabase
          .from('profiles')
          .insert({email: values.email, password: values.password, first_name: values.first_name, last_name: values.last_name})
          .select('*')
          .single()
        if (error)
          alert("Registration Failed")
        else{
          //alert("Successful Registration")

          setSession(data)
          console.log("SESSION:", data)
          localStorage.setItem('sessionData', JSON.stringify(data))
        }
      };
    
      const formik = useFormik({
        initialValues: intialValues,
        onSubmit,

      });
    return(
      <div>
        <div><Header/></div>
        <div className="loginPage">

        <form onSubmit={formik.handleSubmit}>
<div>

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
              <div >
                {formik.errors.first_name}
              </div>
            ) : null}

          </div>

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

        <div>

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
        <div >

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
              <div >
                {formik.errors.password}
              </div>
            ) : null}

        </div>
        <div >
          <button
            type="submit"
            size="large"
            className="w-full"
          >
            Register
          </button>
        </div>
        <div id='switch-to-login'>
          <button onClick={switchTab}>Click Here to Login</button>
        </div>
      </form>
</div>
    </div>
    )
}