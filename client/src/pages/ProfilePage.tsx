import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { getMyCompleteProfile, updateMyProfile, uploadProfileImage, deleteProfileImage, UserProfile } from '../services/profileService';
import '../styles/pages/ProfilePage.scss';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        licenciatura: '',
        carrera: '',
        edad: '',
        telefono: '',
        direccion: '',
        ciudad: ''
    });

    // Cargar perfil al montar
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const data = await getMyCompleteProfile();
                setProfile(data);
                setFormData({
                    licenciatura: data.licenciatura || '',
                    carrera: data.carrera || '',
                    edad: data.edad?.toString() || '',
                    telefono: data.telefono || '',
                    direccion: data.direccion || '',
                    ciudad: data.ciudad || ''
                });
            } catch (err: any) {
                setMessageType('error');
                setMessage('Error al cargar el perfil');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Guardar el archivo original
            setSelectedFile(file);
            
            // Mostrar preview
            const reader = new FileReader();
            reader.onload = (evt) => {
                setImagePreview(evt.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveImage = async () => {
        if (!selectedFile) {
            setMessageType('error');
            setMessage('❌ Selecciona una imagen primero');
            return;
        }

        try {
            setUploadingImage(true);
            await uploadProfileImage(selectedFile);
            setMessageType('success');
            setMessage('✅ Imagen de perfil subida exitosamente');
            setImagePreview(null);
            setSelectedFile(null);
            
            // Recargar página después de 1.5 segundos
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            setMessageType('error');
            setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleUploadImage = async (file: File) => {
        try {
            setUploadingImage(true);
            await uploadProfileImage(file);
            setMessageType('success');
            setMessage('✅ Imagen de perfil subida exitosamente');
            
            // Recargar perfil para mostrar nueva imagen
            setTimeout(() => {
                const loadProfile = async () => {
                    const data = await getMyCompleteProfile();
                    setProfile(data);
                };
                loadProfile();
            }, 1000);
        } catch (err: any) {
            setMessageType('error');
            setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            setUploadingImage(true);
            await deleteProfileImage();
            setProfile((prev) => prev ? { ...prev, profile_image_path: undefined } : null);
            setMessageType('success');
            setMessage('✅ Imagen de perfil eliminada exitosamente');
        } catch (err: any) {
            setMessageType('error');
            setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const updateData = {
                licenciatura: formData.licenciatura || undefined,
                carrera: formData.carrera || undefined,
                edad: formData.edad ? parseInt(formData.edad) : undefined,
                telefono: formData.telefono || undefined,
                direccion: formData.direccion || undefined,
                ciudad: formData.ciudad || undefined
            };

            await updateMyProfile(updateData);
            setEditing(false);
            setMessageType('success');
            setMessage('✅ Perfil actualizado exitosamente');
            
            // Recargar página después de 1.5 segundos
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            setMessageType('error');
            setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <Spinner animation="border" />
                    <p className="mt-2">Cargando perfil...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="profile-page mt-4 mb-4">
            <Row>
                <Col md={8} className="mx-auto">
                    <Card className="profile-card">
                        <Card.Header className="page-header">
                            <h4 className="mb-0">👤 Mi Perfil</h4>
                        </Card.Header>

                        <Card.Body>
                            {message && (
                                <Alert
                                    variant={messageType === 'success' ? 'success' : 'danger'}
                                    onClose={() => setMessage('')}
                                    dismissible
                                >
                                    {message}
                                </Alert>
                            )}

                            {/* Información básica (solo lectura) */}
                            <div className="mb-4">
                                <h5 className="border-bottom pb-2">Información Básica</h5>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Nombre Completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={profile?.nombre_completo || ''}
                                        disabled
                                        className="bg-light"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Número de Colegiado</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={profile?.numero_colegiado || ''}
                                        disabled
                                        className="bg-light"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Correo Electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="bg-light"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">DPI</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={profile?.dpi || ''}
                                        disabled
                                        className="bg-light"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Fecha de Nacimiento</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={profile?.fecha_nacimiento ? new Date(profile.fecha_nacimiento).toLocaleDateString() : ''}
                                        disabled
                                        className="bg-light"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Rol</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={profile?.role === 'votante' ? 'Votante' : 'Administrador'}
                                        disabled
                                        className="bg-light"
                                    />
                                </Form.Group>
                            </div>

                            {/* Foto de Perfil */}
                            <div className="mb-4">
                                <h5 className="border-bottom pb-2">Foto de Perfil</h5>
                                <Row className="align-items-center mt-3">
                                    <Col md={3} className="text-center">
                                        {profile?.profile_image_path ? (
                                            <img
                                                src={`http://localhost:5000${profile.profile_image_path}`}
                                                alt="Perfil"
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '3px solid #0d6efd'
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#e9ecef',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto',
                                                    border: '3px dashed #dee2e6'
                                                }}
                                            >
                                                <span className="text-muted">Sin foto</span>
                                            </div>
                                        )}
                                    </Col>
                                    <Col md={9}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Subir Nueva Foto</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                disabled={uploadingImage}
                                            />
                                            <Form.Text className="text-muted">
                                                Formatos permitidos: JPEG, PNG, GIF, WebP. Máx 5MB
                                            </Form.Text>
                                        </Form.Group>
                                        <div className="d-flex gap-2">
                                            {imagePreview && (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={handleSaveImage}
                                                    disabled={uploadingImage}
                                                >
                                                    {uploadingImage ? 'Subiendo...' : '💾 Guardar Foto'}
                                                </Button>
                                            )}
                                            {profile?.profile_image_path && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={handleDeleteImage}
                                                    disabled={uploadingImage}
                                                >
                                                    🗑️ Eliminar Foto
                                                </Button>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Información adicional (editable) */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                    <h5 className="mb-0">Información Adicional</h5>
                                    {!editing && (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => setEditing(true)}
                                        >
                                            ✏️ Editar
                                        </Button>
                                    )}
                                </div>

                                {editing ? (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Licenciatura</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="licenciatura"
                                                placeholder="Ej: Ingeniería en Sistemas"
                                                value={formData.licenciatura}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Carrera</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="carrera"
                                                placeholder="Ej: Bachiller en Ciencias"
                                                value={formData.carrera}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Edad</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="edad"
                                                placeholder="Ej: 25"
                                                value={formData.edad}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Teléfono</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="telefono"
                                                placeholder="Ej: 2412-3456"
                                                value={formData.telefono}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Dirección</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                name="direccion"
                                                placeholder="Ej: Calle Principal 123, Apartamento 4B"
                                                rows={2}
                                                value={formData.direccion}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Ciudad</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="ciudad"
                                                placeholder="Ej: Guatemala"
                                                value={formData.ciudad}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>

                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="success"
                                                onClick={handleSave}
                                                disabled={loading}
                                            >
                                                💾 Guardar
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setEditing(false);
                                                    // Revertir cambios
                                                    setFormData({
                                                        licenciatura: profile?.licenciatura || '',
                                                        carrera: profile?.carrera || '',
                                                        edad: profile?.edad?.toString() || '',
                                                        telefono: profile?.telefono || '',
                                                        direccion: profile?.direccion || '',
                                                        ciudad: profile?.ciudad || ''
                                                    });
                                                }}
                                            >
                                                ❌ Cancelar
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Licenciatura</Form.Label>
                                            <p className="text-muted">
                                                {profile?.licenciatura || 'No especificado'}
                                            </p>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Carrera</Form.Label>
                                            <p className="text-muted">
                                                {profile?.carrera || 'No especificado'}
                                            </p>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Edad</Form.Label>
                                            <p className="text-muted">
                                                {profile?.edad ? `${profile.edad} años` : 'No especificado'}
                                            </p>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Teléfono</Form.Label>
                                            <p className="text-muted">
                                                {profile?.telefono || 'No especificado'}
                                            </p>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Dirección</Form.Label>
                                            <p className="text-muted">
                                                {profile?.direccion || 'No especificado'}
                                            </p>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Ciudad</Form.Label>
                                            <p className="text-muted">
                                                {profile?.ciudad || 'No especificado'}
                                            </p>
                                        </Form.Group>
                                    </>
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="mt-4 pt-3 border-top">
                                <small className="text-muted">
                                    Perfil creado: {profile?.profile_created_at ? new Date(profile.profile_created_at).toLocaleDateString() : 'No disponible'}<br />
                                    Última actualización: {profile?.profile_updated_at ? new Date(profile.profile_updated_at).toLocaleDateString() : 'No disponible'}
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
