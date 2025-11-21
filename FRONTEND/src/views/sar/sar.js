import React from 'react'; // ← Corregir "react" a "React"
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow
} from '@coreui/react';

const SAR = () => {

    return (
        <CRow>
            <CCol xs={12}>
                <CCard>
                    <CCardHeader>
                        <strong>SAR - Sistema de Administración de Rentas</strong>
                    </CCardHeader>
                    <CCardBody>
                        <p>Gestión de CAI (Código de Autorización de Impresión)</p>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default SAR;