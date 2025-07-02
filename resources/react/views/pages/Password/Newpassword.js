import { CForm, CFormInput, CInputGroup, CInputGroupText, CFormFeedback, CButton, CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react';
import React, { useEffect, useRef, useState } from 'react';
import { getAPICall, post } from '../../../util/api';
import CIcon from '@coreui/icons-react';
import { cilLockLocked } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import { useTranslation } from 'react-i18next';

const Newpassword = () => {
  const { showToast } = useToast();
  const { t } = useTranslation("global");
  const [email, setEmail] = useState('');
  const oldPasswordRef = useRef();
  const [newPassword, setNewPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [validated, setValidated] = useState(false);
  const navigate= useNavigate();
  useEffect(() => {
    handleUser();
  }, []);

  const handleUser = async () => {
    try {
      const response = await getAPICall('/api/user');
      setEmail(response.email);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
    validatePasswords(event.target.value, reEnterPassword);
  };

  const handleReEnterPasswordChange = (event) => {
    setReEnterPassword(event.target.value);
    validatePasswords(newPassword, event.target.value);
  };

  const validatePasswords = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  const handlePassUpdate = async (event) => {
    event.preventDefault();
    setValidated(true);
    if (event.currentTarget.checkValidity() === false || isInvalid) {
      event.stopPropagation();
      return;
    }
    try {
      const newPassData = {
        email: email,
        password: oldPasswordRef.current.value,
        new_password: newPassword,
      };
      const response = await post('/api/changePassword', newPassData);
     if(response.status==1){
      navigate('/login')
     }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
      console.error('Error updating password:', error);
    }
  };

  return (

    <CRow>
      <CCol xs={12}>
        <CCard className='mb-3'>
          <CCardHeader>
            <strong>{t('LABELS.change_password')}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm noValidate validated={validated} onSubmit={handlePassUpdate}>
              <p className="text-body-secondary">{t('LABELS.password_message')}</p>
              
              <CInputGroup className="mb-4">
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  ref={oldPasswordRef}
                  id="oldPassword"
                  type="password"
                  placeholder={t('LABELS.enter_old_password')}
                  autoComplete="current-password"
                  feedbackInvalid="Please provide your current password."
                  required
                />
              </CInputGroup>

              <CInputGroup className="mb-4">
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  onChange={handleNewPasswordChange}
                  id="newPassword"
                  type="password"
                  placeholder={t('LABELS.enter_new_password')}
                  autoComplete="new-password"
                  required
                />
              </CInputGroup>

              <CInputGroup className="mb-4">
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  onChange={handleReEnterPasswordChange}
                  id="reEnterPassword"
                  type="password"
                  invalid={isInvalid}
                  placeholder={t('LABELS.reenter_new_password')}
                  autoComplete="re-enter-new-password"
                  required
                />
                <CFormFeedback invalid>Please re-enter the new password.</CFormFeedback>
              </CInputGroup>

              <CButton type="submit" color="primary">{t('LABELS.update_password')}</CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Newpassword;
