import './SignUp.css'

import email_icon from './Assets_SignUp/email.jpg'


function SignUp() {
  return (
        <div className='container'>
            <div className='header'>
                <div className="text">Sign Up</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>

                 <div className='input'>
                    <input 
                    type='text'
                    placeholder='Username'
                    />
                </div>

                <div className='input'>
                    <img src={email_icon} alt='Email' />
                    <input 
                    type='email'
                    placeholder='Email'
                    />
                </div>

                
               
                <div className='input'>
                    <input 
                    type='password'
                    placeholder='Password'
                    />
                </div>  

            </div> 

            <button className='submit'>
                Sign Up
            </button>

            <div className='login-link'>
                Already have an account? <span>Sign In</span>
            </div>
        </div>
  );
}

export default SignUp; 