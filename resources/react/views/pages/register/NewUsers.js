import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilMobile, cilPeople, cibAmazonPay } from '@coreui/icons'
import { getAPICall, register } from '../../../util/api'
import { getUserData, getUserType, isLogIn, storeUserData } from '../../../util/session'
import { useNavigate } from 'react-router-dom'
import { it } from 'date-fns/locale'
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';

const NewUsers = () => {
  // Add translation hook
  const { t, i18n } = useTranslation("global");

  const [validated, setValidated] = useState(false)
  const [companyList, setCompanyList] = useState([])
  const [rolesList, setRolesList] = useState([{ label: t('LABELS.selectRole'), value: '' }])
  const navigate = useNavigate()
  const nameRef = useRef()
  const emailRef = useRef()
  const mobileRef = useRef()
  const pwdRef = useRef()
  const cPwdRef = useRef()
  const [isTypeInvalid, setTypeIsInvalid] = useState(false);
  const [isCompanyInvalid, setCompanyIsInvalid] = useState(false);
  const typeRef = useRef()
  const companyRef = useRef()
  const { showToast } = useToast();

  const user = getUserData();

  useEffect(() => {
    try {
      // Fetch companies
      getAPICall('/api/company').then((resp) => {
        if (resp?.length) {
          const mappedList = resp.map(itm => ({ label: itm.company_name, value: itm.company_id }));
          if (user.type === 0) {
            setCompanyList(mappedList);
          } else {
            setCompanyList(mappedList.filter(e => e.value === user.company_id));
          }
        }
      })

      // Fetch roles from API
      getAPICall('/api/roles').then((resp) => {
        if (resp?.data?.length) {
          // Create base roles list with initial 'Select Role' option
          let availableRoles = [{ label: t('LABELS.selectRole'), value: '' }];

          // Map API roles to dropdown format
          const mappedRoles = resp.data.map(role => ({
            label: role.name,
            value: role.id.toString()
          }));

          // Filter roles based on user type (similar to the previous logic)
          if (user.type === 0) {
            // Super admin sees all roles
            availableRoles = [...availableRoles, ...mappedRoles];
          } else if (user.type === 1) {
            // Admin sees all except super admin role
            availableRoles = [...availableRoles, ...mappedRoles.filter(role =>
              role.label.toLowerCase() !== 'super admin')];
          } else {
            // Regular users see only user role
            availableRoles = [...availableRoles, ...mappedRoles.filter(role =>
              role.label.toLowerCase() === 'user')];
          }

          setRolesList(availableRoles);
        }
      })
    } catch (error) {
      showToast('danger', t('MSG.errorOccurred', { error }));
    }
  }, [t]);

  const handleSelect = (_, isCompany = false) => {
    const value = parseInt(isCompany ? companyRef.current.value : typeRef.current.value, 10);
    if (isCompany) {
      setCompanyIsInvalid(!(value > 0));
    } else {
      setTypeIsInvalid(!value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    const form = event.currentTarget

    if (form.checkValidity() === false) {
      setValidated(true)
      return
    }

    const userData = {
      name: nameRef.current?.value,
      email: emailRef.current?.value,
      mobile: mobileRef.current?.value,
      password: pwdRef.current?.value,
      password_confirmation: cPwdRef.current?.value,
      type: typeRef.current?.value,
      company_id: companyRef.current?.value,
    };

    try {
      const resp = await register(userData)
      if (resp) {
        showToast('success', t('MSG.userCreatedSuccess'));
      }
      else {
        showToast('danger', t('MSG.errorTryAgain'));
      }
    } catch (error) {
      showToast('danger', t('MSG.errorOccurred', { error }));
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row ">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={12} xl={12}>
            <CCard className="mx-6">
              <CCardHeader>
                <strong>{t('LABELS.createUser')} </strong>
              </CCardHeader>
              <CCardBody className="p-4">
                <CForm noValidate validated={validated} onSubmit={handleSubmit}>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cibAmazonPay} />
                    </CInputGroupText>
                    <CFormSelect
                      onChange={(e) => handleSelect(e, true)}
                      aria-label={t('LABELS.selectCompany')}
                      ref={companyRef}
                      invalid={isCompanyInvalid}
                      options={companyList}
                      feedbackInvalid={t('MSG.selectCompany')}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilPeople} />
                    </CInputGroupText>
                    <CFormSelect
                      onChange={handleSelect}
                      aria-label={t('LABELS.selectRole')}
                      ref={typeRef}
                      invalid={isTypeInvalid}
                      options={rolesList}
                      feedbackInvalid={t('MSG.selectValidRole')}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      ref={nameRef}
                      type='username'
                      placeholder={t('LABELS.username')}
                      autoComplete="name"
                      required
                      feedbackInvalid={t('MSG.provideName')}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      ref={emailRef}
                      placeholder={t('LABELS.email')}
                      autoComplete="email"
                      type='email'
                      required
                      feedbackInvalid={t('MSG.provideEmail')}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilMobile} />
                    </CInputGroupText>
                    <CFormInput
                      ref={mobileRef}
                      placeholder={t('LABELS.mobile')}
                      autoComplete="phone"
                      type='mobile'
                      required
                      feedbackInvalid={t('MSG.provideMobile')}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      ref={pwdRef}
                      placeholder={t('LABELS.enterNewPassword')}
                      autoComplete="new-password"
                      required
                      feedbackInvalid={t('MSG.providePassword')}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      ref={cPwdRef}
                      type="password"
                      placeholder={t('LABELS.confirmPassword')}
                      autoComplete="new-password"
                      required
                      feedbackInvalid={t('MSG.provideConfirmPassword')}
                    />
                  </CInputGroup>
                  <div className="d-grid col-sm-3">
                    <CButton color="success" type="submit">
                      {t('LABELS.save')}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default NewUsers;
//---------------------------------------------------

// import React, { useEffect, useRef, useState } from 'react'
// import {
//   CAlert,
//   CButton,
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CContainer,
//   CDropdown,
//   CDropdownItem,
//   CDropdownMenu,
//   CDropdownToggle,
//   CForm,
//   CFormInput,
//   CFormSelect,
//   CInputGroup,
//   CInputGroupText,
//   CRow,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilLockLocked, cilUser, cilMobile, cilPeople, cibAmazonPay } from '@coreui/icons'
// import { getAPICall, register } from '../../../util/api'
// import { getUserData, getUserType, isLogIn, storeUserData } from '../../../util/session'
// import { useNavigate } from 'react-router-dom'
// import { it } from 'date-fns/locale'
// import { useToast } from '../../common/toast/ToastContext';

// const NewUsers = () => {
//   const [validated, setValidated] = useState(false)
//   const [companyList, setCompanyList] = useState([])
//   const [rolesList, setRolesList] = useState([{ label: 'Select Role', value: '' }])
//   const navigate = useNavigate()
//   const nameRef = useRef()
//   const emailRef = useRef()
//   const mobileRef = useRef()
//   const pwdRef = useRef()
//   const cPwdRef = useRef()
//   const [isTypeInvalid, setTypeIsInvalid] = useState(false);
//   const [isCompanyInvalid, setCompanyIsInvalid] = useState(false);
//   const typeRef = useRef()
//   const companyRef = useRef()
//   const { showToast } = useToast();

//   const user = getUserData();

//   useEffect(() => {
//     try {
//       // Fetch companies
//       getAPICall('/api/company').then((resp) => {
//         if (resp?.length) {
//           const mappedList = resp.map(itm => ({ label: itm.company_name, value: itm.company_id }));
//           if (user.type === 0) {
//             setCompanyList(mappedList);
//           } else {
//             setCompanyList(mappedList.filter(e => e.value === user.company_id));
//           }
//         }
//       })

//       // Fetch roles from API
//       getAPICall('/api/roles').then((resp) => {
//         if (resp?.data?.length) {
//           // Create base roles list with initial 'Select Role' option
//           let availableRoles = [{ label: 'Select Role', value: '' }];

//           // Map API roles to dropdown format
//           const mappedRoles = resp.data.map(role => ({
//             label: role.name,
//             value: role.id.toString()
//           }));

//           // Filter roles based on user type (similar to the previous logic)
//           if (user.type === 0) {
//             // Super admin sees all roles
//             availableRoles = [...availableRoles, ...mappedRoles];
//           } else if (user.type === 1) {
//             // Admin sees all except super admin role
//             availableRoles = [...availableRoles, ...mappedRoles.filter(role =>
//               role.label.toLowerCase() !== 'super admin')];
//           } else {
//             // Regular users see only user role
//             availableRoles = [...availableRoles, ...mappedRoles.filter(role =>
//               role.label.toLowerCase() === 'user')];
//           }

//           setRolesList(availableRoles);
//         }
//       })
//     } catch (error) {
//       showToast('danger', 'Error occurred ' + error);
//     }
//   }, []);

//   const handleSelect = (_, isCompany = false) => {
//     const value = parseInt(isCompany ? companyRef.current.value : typeRef.current.value, 10);
//     if (isCompany) {
//       setCompanyIsInvalid(!(value > 0));
//     } else {
//       setTypeIsInvalid(!value);
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault()
//     event.stopPropagation()

//     const form = event.currentTarget

//     if (form.checkValidity() === false) {
//       setValidated(true)
//       return
//     }

//     const userData = {
//       name: nameRef.current?.value,
//       email: emailRef.current?.value,
//       mobile: mobileRef.current?.value,
//       password: pwdRef.current?.value,
//       password_confirmation: cPwdRef.current?.value,
//       type: typeRef.current?.value,
//       company_id: companyRef.current?.value,
//     };

//     try {
//       const resp = await register(userData)
//       if (resp) {
//         showToast('success', 'New user is created successfully');
//       }
//       else {
//         showToast('danger', 'Error occurred, please try again later.');
//       }
//     } catch (error) {
//       showToast('danger', 'Error occurred ' + error);
//     }
//   }

//   return (
//     <div className="bg-body-tertiary min-vh-100 d-flex flex-row ">
//       <CContainer>
//         <CRow className="justify-content-center">
//           <CCol md={9} lg={12} xl={12}>
//             <CCard className="mx-6">
//               <CCardHeader>
//                 <strong>Create User </strong>
//               </CCardHeader>
//               <CCardBody className="p-4">
//                 <CForm noValidate validated={validated} onSubmit={handleSubmit}>
//                   <CInputGroup className="mb-4">
//                     <CInputGroupText>
//                       <CIcon icon={cibAmazonPay} />
//                     </CInputGroupText>
//                     <CFormSelect
//                       onChange={(e) => handleSelect(e, true)}
//                       aria-label="Select Shop / Company"
//                       ref={companyRef}
//                       invalid={isCompanyInvalid}
//                       options={companyList}
//                       feedbackInvalid="Select Shop / Company"
//                     />
//                   </CInputGroup>

//                   <CInputGroup className="mb-4">
//                     <CInputGroupText>
//                       <CIcon icon={cilPeople} />
//                     </CInputGroupText>
//                     <CFormSelect
//                       onChange={handleSelect}
//                       aria-label="Select Role"
//                       ref={typeRef}
//                       invalid={isTypeInvalid}
//                       options={rolesList}
//                       feedbackInvalid="Please select a valid role."
//                     />
//                   </CInputGroup>

//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>
//                       <CIcon icon={cilUser} />
//                     </CInputGroupText>
//                     <CFormInput
//                       ref={nameRef}
//                       type='username'
//                       placeholder="Username"
//                       autoComplete="name"
//                       required
//                       feedbackInvalid="Please provide name."
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>@</CInputGroupText>
//                     <CFormInput
//                       ref={emailRef}
//                       placeholder="Email"
//                       autoComplete="email"
//                       type='email'
//                       required
//                       feedbackInvalid="Please provide email."
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>
//                       <CIcon icon={cilMobile} />
//                     </CInputGroupText>
//                     <CFormInput
//                       ref={mobileRef}
//                       placeholder="Mobile"
//                       autoComplete="phone"
//                       type='mobile'
//                       required
//                       feedbackInvalid="Please provide mobile number."
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>
//                       <CIcon icon={cilLockLocked} />
//                     </CInputGroupText>
//                     <CFormInput
//                       type="password"
//                       ref={pwdRef}
//                       placeholder="Enter New Password"
//                       autoComplete="new-password"
//                       required
//                       feedbackInvalid="Please provide password."
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-4">
//                     <CInputGroupText>
//                       <CIcon icon={cilLockLocked} />
//                     </CInputGroupText>
//                     <CFormInput
//                       ref={cPwdRef}
//                       type="password"
//                       placeholder="Confirm  password"
//                       autoComplete="new-password"
//                       required
//                       feedbackInvalid="Please provide confirm password."
//                     />
//                   </CInputGroup>
//                   <div className="d-grid col-sm-3">
//                     <CButton color="success" type="submit">
//                       Save
//                     </CButton>
//                   </div>
//                 </CForm>
//               </CCardBody>
//             </CCard>
//           </CCol>
//         </CRow>
//       </CContainer>
//     </div>
//   )
// }

// export default NewUsers;

//--------------------------------------------------------------

// import React, { useEffect, useRef, useState } from 'react'
// import {
//   CAlert,
//   CButton,
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CContainer,
//   CDropdown,
//   CDropdownItem,
//   CDropdownMenu,
//   CDropdownToggle,
//   CForm,
//   CFormInput,
//   CFormSelect,
//   CInputGroup,
//   CInputGroupText,
//   CRow,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilLockLocked, cilUser, cilMobile,cilPeople, cibAmazonPay } from '@coreui/icons'
// import { getAPICall, register } from '../../../util/api'
// import { getUserData, getUserType, isLogIn, storeUserData } from '../../../util/session'
// import { useNavigate } from 'react-router-dom'
// import { it } from 'date-fns/locale'
// import { useToast } from '../../common/toast/ToastContext';

// const NewUsers = () => {
//   const [validated, setValidated] = useState(false)
//   const [companyList, setCompanyList] = useState([])
//   const navigate = useNavigate()
//   const nameRef = useRef()
//   const emailRef = useRef()
//   const mobileRef = useRef()
//   const pwdRef = useRef()
//   const cPwdRef = useRef()
//   const [isTypeInvalid, setTypeIsInvalid] = useState(false);
//   const [isCompanyInvalid, setCompanyIsInvalid] = useState(false);
//   const typeRef = useRef()
//   const companyRef = useRef()
//   const { showToast } = useToast();
//   // const [userData, setUserData] = useState({
//   //   name: '',
//   //   email: '',
//   //   mobile: '',
//   //   password: '',
//   //   password_confirmation: '',
//   //   type: '',
//   // });

//   let userTypes=[];
//   const user =getUserData();
//   if(user.type=== 0){
//     userTypes= [
//       { label: 'Select User Type ', value: '' },
//       { label: 'Super Admin', value: '0' },
//       { label: 'Admin', value: '1' },
//       { label: 'User', value: '2', disabled: false }
//     ]
//   }else if(user.type === 1)
//     {
//       userTypes= [
//         { label: 'Select User Type ', value: '' },
//         { label: 'Admin', value: '1' },
//         { label: 'User', value: '2', disabled: false }
//       ]
//     }
//   else{
//     userTypes= [
//       { label: 'Select User Type ', value: '' },
//       { label: 'User', value: '2', disabled: false }
//     ]
//   }

//   useEffect(()=>{
//     try {
//       getAPICall('/api/company').then((resp) => {
//         // Super Admin => All company
//         // Admin => self company
//         if (resp?.length) {
//           const mappedList = resp.map(itm => ({ label: itm.company_name, value: itm.company_id }));
//           if (user.type === 0) {
//             setCompanyList(mappedList);
//           } else {
//             setCompanyList(mappedList.filter(e => e.value === user.company_id));
//           }
//         }
//       })
//     } catch (error) {
//       showToast('danger', 'Error occured ' + error);
//     }
//   },[]);


//   const handleSelect = (_, isCompany = false) => {
//     const value = parseInt(isCompany ? companyRef.current.value : typeRef.current.value, 10);
//     if(isCompany){
//       setCompanyIsInvalid(!(value > 0));
//     }else{
//       setTypeIsInvalid(![0, 1, 2].includes(value));
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault()
//     event.stopPropagation()

//     const form = event.currentTarget

//     if (form.checkValidity() === false) {
//       setValidated(true)
//       return
//     }

//    const userData = {
//       name: nameRef.current?.value,
//       email: emailRef.current?.value,
//       mobile: mobileRef.current?.value,
//       password: pwdRef.current?.value,
//       password_confirmation: cPwdRef.current?.value,
//       type: typeRef.current?.value,
//       company_id: companyRef.current?.value,
//     };

//     try {
//       const resp = await register(userData)
//       if(resp){
//         showToast('success','New user is created succesfully');
//       }
//       else{
//         showToast('danger','Error occured, please try again later.');
//       }
//     } catch (error) {
//       showToast('danger','Error occured '+ error);
//     }
//   }

//   return (
//     <div className="bg-body-tertiary min-vh-100 d-flex flex-row ">
//       <CContainer>
//         <CRow className="justify-content-center">
//           <CCol md={9} lg={12} xl={12}>
//             <CCard className="mx-6">
//             <CCardHeader>
//                         <strong>Create User </strong>
//                     </CCardHeader>
//               <CCardBody className="p-4">
//                 <CForm noValidate validated={validated} onSubmit={handleSubmit}>
//                   {/* <h1>Register User </h1>
//                   <p className="text-body-secondary">Create User account</p> */}

//                   <CInputGroup className="mb-4">
//                     <CInputGroupText>
//                       <CIcon icon={cibAmazonPay} />
//                     </CInputGroupText>
//                     <CFormSelect
//                       onChange={(e)=>handleSelect(e,true)}
//                       aria-label="Select Shop / Company"
//                       ref={companyRef}
//                       invalid={isCompanyInvalid}
//                       options={companyList}
//                       feedbackInvalid="Select Shop / Company"
//                     />
//                   </CInputGroup>

//                   <CInputGroup className="mb-4">
//                     <CInputGroupText>
//                       <CIcon icon={cilPeople} />
//                     </CInputGroupText>
//                     <CFormSelect
//                       onChange={handleSelect}
//                       aria-label="Default select example"
//                       ref={typeRef}
//                       invalid={isTypeInvalid}
//                       options={userTypes}
//                       feedbackInvalid="Please select a valid option."
//                     />
//                   </CInputGroup>

//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>
//                       <CIcon icon={cilUser} />
//                     </CInputGroupText>
//                     <CFormInput
//                       ref={nameRef}
//                       type='username'
//                       placeholder="Username"
//                       autoComplete="name"
//                       required
//                       feedbackInvalid="Please provide name."
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>@</CInputGroupText>
//                     <CFormInput
//                       ref={emailRef}
//                       placeholder="Email"
//                       autoComplete="email"
//                       type='email'
//                       required
//                       feedbackInvalid="Please provide email."
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>
//                       <CIcon icon={cilMobile} />
//                     </CInputGroupText>
//                     <CFormInput
//                       ref={mobileRef}
//                       placeholder="Mobile"
//                       autoComplete="phone"
//                       type='mobile'
//                       required
//                       feedbackInvalid="Please provide mobile number."
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>
//                       <CIcon icon={cilLockLocked} />
//                     </CInputGroupText>
//                     <CFormInput
//                       type="password"
//                       ref={pwdRef}
//                       placeholder="Enter New Password"
//                       autoComplete="new-password"
//                       required
//                       feedbackInvalid="Please provide password."
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-4">
//                     <CInputGroupText>
//                       <CIcon icon={cilLockLocked} />
//                     </CInputGroupText>
//                     <CFormInput
//                       ref={cPwdRef}
//                       type="password"
//                       placeholder="Confirm  password"
//                       autoComplete="new-password"
//                       required
//                       feedbackInvalid="Please provide confirm password."
//                     />
//                   </CInputGroup>
//                   <div className="d-grid col-sm-3">
//                     <CButton color="success" type="submit">
//                       Save
//                     </CButton>
//                   </div>
//                 </CForm>
//               </CCardBody>
//             </CCard>
//           </CCol>
//         </CRow>
//       </CContainer>
//     </div>
//   )
// }

// export default NewUsers
