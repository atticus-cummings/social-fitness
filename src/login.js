import { FormikHelpers, useFormik } from 'formik';
import './Auth.css'
import React, { useState } from 'react';
import {Header} from "./components/header";

export default function Login({supabase, setSession, session}){
  
    const intialValues = {
        email: '',
        password: '',
      };


      const onSubmit = async (
        values,
        { resetForm, setFieldError },
      ) => {   
        window.globalVar++; 
        if (session){
          setSession(null)
        }  
        const {data, error} = await supabase
          .from('profiles')
          .select('*')
          .match({email: values.email, password: values.password})
          .single()
      console.log("SESSION NULL DEBUG:", data)
      console.log("EMAIL:", values.email)
      console.log("pass:", values.password)

      if(error)
        console.error(error)
      if (data === null ){
        alert("Failure to Login");
      }
      else{
        console.log("session:", data)
        console.log("DOCUMENT COOKIE:", document.cookie);
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
          <div className="w-1/2" id="login">
          <div className="justify-center" >
          <form onSubmit={formik.handleSubmit}>
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
              Log In
            </button>
          <div id='switch-to-register'>
            <a href="/register">Click here to register</a>
          </div>
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
      </div>
    </div>
    )
}