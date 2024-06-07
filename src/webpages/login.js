import { FormikHelpers, useFormik } from 'formik';
import React, { useState } from 'react';
import {Header} from "../components/header";
import './login.css';


export default function Login({supabase, setSession, session, setHomepageView}){
    const intialValues = {
        email: '',
        password: '',
      };

      const switchTab = () => {
        setHomepageView('fuck')
      };
      const onSubmit = async (
        values,
        { resetForm, setFieldError },
      ) => {   
        if (session){
          setSession(null)
          console.log("SESSION SET FROM SESSION TO NULL:", session)
        }  
        const {data, error} = await supabase
          .from('profiles')
          .select('*')
          .match({email: values.email, password: values.password})
          .single()


      if(error)
        console.error(error)
      if (data === null ){
        alert("Failure to Login");
      }
      else{
        setSession(data)
        localStorage.setItem('sessionData', JSON.stringify(data))
        //document.cookie = JSON.stringify(session);
      }
      };
    
    //step 1- check email and password

    
      const formik = useFormik({
        initialValues: intialValues,
        onSubmit,
      });
    return(
      <div>
          <div><Header/><div/>
          <div className="loginPage">
          <form  onSubmit={formik.handleSubmit}>
  
            <div >
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
              </div>
              <div>
              {formik.touched.email && formik.errors.email ? (
                <div >
                  {formik.errors.email}
                </div>
              ) : null}
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
              </div>
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className="mt-2 text-sm text-red-600">
                  {formik.errors.password}
                </div>
              ) : null}

            <button
              type="submit"
              
              size="large"
              className="w-full"
            >
              Log In
            </button>
          <div id='switch-to-register'>
            <button onClick={switchTab}>Click Here to Register</button>
          </div>
        </form>
        </div>
        </div>
        </div> 

    )
}