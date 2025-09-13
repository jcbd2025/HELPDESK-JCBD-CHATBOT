import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaRegClock, FaCheckCircle, FaHistory, FaTimes, FaExclamationTriangle, FaCheck, FaSpinner } from "react-icons/fa";
import styles from "../styles/SolucionTickets.module.css";
import ChatBot from "../Componentes/ChatBot";
import MenuVertical from "../Componentes/MenuVertical";
import { useNotification } from "../context/NotificationContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SolucionTickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [showOptions, setShowOptions] = useState(false);
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [solutionFormData, setSolutionFormData] = useState({
    descripcion: "",
    archivos: [],
  });
  
  // Estados para los datos del ticket
  const [originalTicket, setOriginalTicket] = useState({});
  const [ticket, setTicket] = useState({
    id: "",
    titulo: "",
    descripcion: "",
    solicitante: "",
    prioridad: "",
    estado: "",
    tecnico: "",
    grupo: "",
    categoria: "",
    fechaApertura: "",
    ultimaActualizacion: "",
    tipo: "incidencia",
    ubicacion: "",
    observador: "",
    asignadoA: "",
    grupoAsignado: "",
  });
  
  const [categorias, setCategorias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de edición independientes
  const [isEditingVerticalForm, setIsEditingVerticalForm] = useState(false);
  const [isEditingTicketInfo, setIsEditingTicketInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para modales
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const { addNotification } = useNotification();
  const userRole = localStorage.getItem("rol");
  const isAdminOrTech = ["administrador", "tecnico"].includes(userRole);

  // Función para mostrar modal de éxito
  const showSuccess = (message, title = "Éxito") => {
    setModalTitle(title);
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  // Función para mostrar modal de error
  const showError = (message, title = "Error") => {
    setModalTitle(title);
    setModalMessage(message);
    setShowErrorModal(true);
  };

  // Función para mostrar modal de advertencia
  const showWarning = (message, title = "Advertencia") => {
    setModalTitle(title);
    setModalMessage(message);
    setShowWarningModal(true);
  };

  // Función para mostrar modal de confirmación
  const showConfirmation = (message, title, onConfirm) => {
    setModalTitle(title);
    setModalMessage(message);
    setConfirmAction(() => onConfirm);
    setShowConfirmModal(true);
  };

  // Función para mostrar modal de carga
  const showLoading = (message = "Procesando...", title = "Cargando") => {
    setModalTitle(title);
    setModalMessage(message);
    setShowLoadingModal(true);
  };

  // Cerrar modales
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };
  
  // Función para ocultar modal de carga
  const hideLoading = () => {
    setShowLoadingModal(false);
  };

  const SeguimientoItem = ({ seguimiento }) => {
    const isSolucion = seguimiento.tipo === "solucion";

    return (
      <div className={isSolucion ? styles.solucionItem : styles.seguimientoItem}>
        <div className={isSolucion ? styles.solucionHeader : styles.seguimientoHeader}>
          <span className={isSolucion ? styles.solucionUsuario : styles.seguimientoUsuario}>
            {seguimiento.usuario}
          </span>
          <span className={isSolucion ? styles.solucionFecha : styles.seguimientoFecha}>
            {new Date(seguimiento.fecha).toLocaleString()}
          </span>
        </div>
        <div className={isSolucion ? styles.solucionContent : styles.seguimientoContent}>
          <p>{seguimiento.descripcion}</p>
          {seguimiento.archivos && seguimiento.archivos.length > 0 && (
            <div className={styles.archivosContainer}>
              <strong>Archivos adjuntos:</strong>
              <ul>
                {seguimiento.archivos.map((archivo, index) => (
                  <li key={index}>
                    <a
                      href={`${API_BASE_URL}/uploads/${archivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {archivo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowOptions(false);

    if (option === "solucion" || option === "seguimiento") {
      setShowSolutionForm(true);
    } else {
      setShowSolutionForm(false);
    }
  };

  const handleSolutionFileChange = (e) => {
    const { files } = e.target;
    if (files) {
      setSolutionFormData((prev) => ({
        ...prev,
        archivos: Array.from(files),
      }));
    }
  };

  const removeSolutionFile = (index) => {
    setSolutionFormData((prev) => {
      const newFiles = [...prev.archivos];
      newFiles.splice(index, 1);
      return { ...prev, archivos: newFiles };
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        showLoading("Cargando datos del ticket...");
        
        const [ticketRes, categoriasRes, seguimientosRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/usuarios/tickets/${id}`),
          axios.get(`${API_BASE_URL}/usuarios/obtenerCategorias`),
          axios.get(`${API_BASE_URL}/usuarios/tickets/${id}/seguimientos`),
        ]);

        const ticketData = ticketRes.data;
        setTicket(ticketData);
        setOriginalTicket(ticketData); // Guardar copia original
        setCategorias(categoriasRes.data);
        setSeguimientos(seguimientosRes.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // Datos de ejemplo para desarrollo
        const sampleData = {
          id: id || "TKT-001",
          titulo: "Problema con el sistema de impresión",
          descripcion: "El sistema no imprime correctamente los documentos largos",
          solicitante: "Usuario Ejemplo",
          prioridad: "Alta",
          estado: "Abierto",
          tecnico: "Técnico Asignado",
          grupo: "Soporte Técnico",
          categoria: "Hardware",
          fechaApertura: "2023-05-10 09:30:00",
          ultimaActualizacion: "2023-05-12 14:15:00",
          tipo: "incidencia",
          ubicacion: "Oficina Central",
          observador: "",
          asignadoA: "Técnico Asignado",
          grupoAsignado: "Soporte Técnico",
        };
        setTicket(sampleData);
        setOriginalTicket(sampleData);
      } finally {
        setLoading(false);
        setIsLoading(false);
        hideLoading();
      }
    };

    fetchAllData();
  }, [id]);

  // Manejador de cambios para el formulario vertical
  const handleVerticalFormChange = (e) => {
    const { name, value } = e.target;
    setTicket((prev) => ({
      ...prev,
      [name]: value,
      ultimaActualizacion: new Date().toLocaleString(),
    }));
  };

  // Manejador de cambios para la información principal del ticket
  const handleTicketInfoChange = (e) => {
    const { name, value } = e.target;
    setTicket((prev) => ({
      ...prev,
      [name]: value,
      ultimaActualizacion: new Date().toLocaleString(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!solutionFormData.descripcion.trim()) {
      showError("Por favor ingrese la solución o seguimiento");
      return;
    }

    try {
      setIsLoading(true);
      showLoading(selectedOption === "solucion" 
        ? "Guardando solución..." 
        : "Guardando seguimiento...");

      const endpoint =
        selectedOption === "solucion"
          ? `${API_BASE_URL}/usuarios/tickets/${id}/solucionar`
          : `${API_BASE_URL}/usuarios/tickets/${id}/seguimientos`;

      const formDataToSend = new FormData();
      formDataToSend.append("descripcion", solutionFormData.descripcion);
      formDataToSend.append("usuario", localStorage.getItem("nombre"));

      if (selectedOption === "solucion") {
        formDataToSend.append("estado", "resuelto");
        formDataToSend.append("tipo", "solucion");
      } else {
        formDataToSend.append("tipo", "seguimiento");
      }

      solutionFormData.archivos.forEach((file) => {
        formDataToSend.append("archivos", file);
      });

      await axios.post(endpoint, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refrescar los datos del ticket y seguimientos
      const [ticketRes, seguimientosRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/usuarios/tickets/${id}`),
        axios.get(`${API_BASE_URL}/usuarios/tickets/${id}/seguimientos`),
      ]);

      const updatedTicket = ticketRes.data;
      setTicket(updatedTicket);
      setOriginalTicket(updatedTicket);
      setSeguimientos(seguimientosRes.data);
      setSolutionFormData({ descripcion: "", archivos: [] });
      setShowSolutionForm(false);

      if (selectedOption === "solucion") {
        showSuccess("Solución guardada. El ticket se ha cerrado.", "Solución Aplicada");
        setTimeout(() => {
          navigate(`/EncuestaSatisfaccion/${id}`);
        }, 2000);
      } else {
        showSuccess("Seguimiento guardado correctamente.", "Seguimiento Registrado");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMessage = error.response?.data?.message || "Error al procesar la solicitud";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const handleSaveChanges = async (section) => {
    try {
      setIsLoading(true);
      showLoading("Guardando cambios...");

      if (!ticket.titulo || !ticket.descripcion) {
        showError("Título y descripción son campos obligatorios");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/usuarios/tickets/${id}/actualizar`,
        ticket
      );

      const updatedTicket = response.data;
      setTicket(updatedTicket);
      setOriginalTicket(updatedTicket);
      
      // Cerrar el modo edición según la sección
      if (section === 'vertical') {
        setIsEditingVerticalForm(false);
      } else {
        setIsEditingTicketInfo(false);
      }
      
      showSuccess("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      const errorMessage = error.response?.data?.message || "Error al guardar cambios";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const handleCancelEdit = (section) => {
    // Restaurar los valores originales desde la copia de respaldo
    setTicket(originalTicket);
    
    // Cerrar el modo edición según la sección
    if (section === 'vertical') {
      setIsEditingVerticalForm(false);
    } else {
      setIsEditingTicketInfo(false);
    }
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";

    if (dateString.includes("T")) {
      return dateString.substring(0, 16);
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const pad = (num) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  if (loading) {
    return (
      <MenuVertical>
        <div className={styles.loading}>Cargando ticket...</div>
      </MenuVertical>
    );
  }

  return (
    <MenuVertical>
      <div className={styles.containerColumnas}>
        <div className={styles.containersolucion}>
          <h1 className={styles.title}>Solución del Ticket #{ticket.id}</h1>

          {isLoading && (
            <div className={styles.loadingIndicator}>Guardando cambios...</div>
          )}

          <div className={styles.mainLayout}>
            {/* Columna izquierda - Información del ticket */}
            <div className={styles.ticketInfoContainer}>
              <div className={styles.header}>
                <h3>Información del Ticket</h3>
                {!isEditingVerticalForm && isAdminOrTech && (
                  <button
                    onClick={() => setIsEditingVerticalForm(true)}
                    className={styles.editButton}
                    disabled={isLoading}
                  >
                    Editar
                  </button>
                )}
              </div>

              <div className={styles.verticalForm}>
                <h4>Datos del Ticket</h4>

                <div className={styles.formGroup}>
                  <label className={styles.fecha}>Fecha de apertura:</label>
                  <input
                    type="datetime-local"
                    name="fechaApertura"
                    value={formatDateTimeForInput(ticket.fechaApertura)}
                    onChange={handleVerticalFormChange}
                    disabled={!isEditingVerticalForm || !isAdminOrTech}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tipo:</label>
                  <select
                    name="tipo"
                    value={ticket.tipo}
                    onChange={handleVerticalFormChange}
                    disabled={!isEditingVerticalForm || !isAdminOrTech}
                  >
                    <option value="incidencia">Incidencia</option>
                    <option value="requerimiento">Requerimiento</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Categoría:</label>
                  <select
                    name="categoria"
                    value={ticket.categoria}
                    onChange={handleVerticalFormChange}
                    disabled={!isEditingVerticalForm || !isAdminOrTech}
                  >
                    <option value="">Seleccione...</option>
                    {categorias?.map((categoria) => (
                      <option
                        key={categoria.id_categoria}
                        value={categoria.id_categoria}
                      >
                        {categoria.nombre_categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Estado:</label>
                  <select
                    name="estado"
                    value={ticket.estado}
                    onChange={handleVerticalFormChange}
                    disabled={!isEditingVerticalForm || !isAdminOrTech}
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="en-curso">En curso</option>
                    <option value="en-espera">En espera</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Prioridad:</label>
                  <select
                    name="prioridad"
                    value={ticket.prioridad}
                    onChange={handleVerticalFormChange}
                    disabled={!isEditingVerticalForm || !isAdminOrTech}
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Ubicación:</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={ticket.ubicacion}
                    onChange={handleVerticalFormChange}
                    disabled={!isEditingVerticalForm || !isAdminOrTech}
                  />
                </div>

                <h4>Asignaciones</h4>

                <div className={styles.formGroup}>
                  <label>Solicitante:</label>
                  <input
                    type="text"
                    name="solicitante"
                    value={ticket.solicitante}
                    onChange={handleVerticalFormChange}
                    disabled={!isEditingVerticalForm || !isAdminOrTech}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Observador:</label>
                  <input
                    type="text"
                    name="observador"
                    value={ticket.observador}
                    onChange={handleVerticalFormChange}
                    disabled={!isEditingVerticalForm || !isAdminOrTech}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Asignado a:</label>
                  {isAdminOrTech ? (
                    <select
                      name="asignadoA"
                      value={ticket.asignadoA}
                      onChange={handleVerticalFormChange}
                      disabled={!isEditingVerticalForm || !isAdminOrTech}
                    >
                      <option value="">Seleccionar técnico</option>
                      {tecnicos.map((tec) => (
                        <option key={tec.id} value={tec.nombre}>
                          {tec.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={ticket.asignadoA} disabled />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Grupo asignado:</label>
                  {isAdminOrTech ? (
                    <select
                      name="grupoAsignado"
                      value={ticket.grupoAsignado}
                      onChange={handleVerticalFormChange}
                      disabled={!isEditingVerticalForm || !isAdminOrTech}
                    >
                      <option value="">Seleccionar grupo</option>
                      {grupos.map((grupo) => (
                        <option key={grupo.id} value={grupo.nombre}>
                          {grupo.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={ticket.grupoAsignado} disabled />
                  )}
                </div>
              </div>

              {isEditingVerticalForm && isAdminOrTech && (
                <div className={styles.actions}>
                  <button
                    onClick={() => handleSaveChanges('vertical')}
                    className={styles.saveButton}
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button
                    onClick={() => handleCancelEdit('vertical')}
                    className={styles.cancelButton}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Columna central - Contenido principal */}
            <div className={styles.mainContentContainer}>
              <div className={styles.ticketInfo}>
                <div className={styles.ticketHeader}>
                  {isEditingTicketInfo ? (
                    <input
                      type="text"
                      name="titulo"
                      value={ticket.titulo}
                      onChange={handleTicketInfoChange}
                      className={styles.editInput}
                    />
                  ) : (
                    <span className={styles.ticketTitle}>{ticket.titulo}</span>
                  )}

                  {isEditingTicketInfo ? (
                    <select
                      name="prioridad"
                      value={ticket.prioridad}
                      onChange={handleTicketInfoChange}
                      className={styles.editSelect}
                      data-priority={ticket.prioridad.toLowerCase()}
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  ) : (
                    <span
                      className={styles.ticketPriority}
                      data-priority={ticket.prioridad.toLowerCase()}
                    >
                      {ticket.prioridad}
                    </span>
                  )}
                </div>

                <div className={styles.ticketDescription}>
                  {isEditingTicketInfo ? (
                    <textarea
                      name="descripcion"
                      value={ticket.descripcion}
                      onChange={handleTicketInfoChange}
                      className={styles.editTextarea}
                    />
                  ) : (
                    <p>{ticket.descripcion}</p>
                  )}
                </div>

                <div className={styles.ticketMeta}>
                  <div>
                    <strong>Solicitante:</strong> {ticket.solicitante}
                  </div>
                  <div>
                    <strong>Fecha apertura:</strong> {ticket.fechaApertura}
                  </div>
                  <div>
                    <strong>Última actualización:</strong>{" "}
                    {ticket.ultimaActualizacion}
                  </div>
                  <div>
                    <strong>Categoría:</strong>
                    {isEditingTicketInfo ? (
                      <input
                        type="text"
                        name="categoria"
                        value={ticket.categoria}
                        onChange={handleTicketInfoChange}
                        className={styles.editInput}
                      />
                    ) : (
                      ticket.categoria
                    )}
                  </div>
                </div>

                <div className={styles.ticketActions}>
                  {isEditingTicketInfo ? (
                    <>
                      <button
                        onClick={() => handleSaveChanges('ticket')}
                        className={styles.saveButton}
                        disabled={isLoading}
                      >
                        {isLoading ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        onClick={() => handleCancelEdit('ticket')}
                        className={styles.cancelButtons}
                        disabled={isLoading}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingTicketInfo(true)}
                      className={styles.editButton}
                      disabled={isLoading}
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>

              {/* Botón de opciones y formulario */}
              <div className={styles.optionsContainerWrapper} ref={dropdownRef}>
                {showOptions && (
                  <div className={styles.optionsDropup}>
                    <button
                      className={styles.optionItems}
                      onClick={() => handleOptionSelect("solucion")}
                    >
                      Agregar solución
                    </button>
                    <button
                      className={styles.optionItems}
                      onClick={() => handleOptionSelect("seguimiento")}
                    >
                      Seguimiento
                    </button>
                  </div>
                )}
                
                <button
                  className={styles.optionsButtons}
                  onClick={() => setShowOptions(!showOptions)}
                >
                  Acciones
                  <span className={styles.arrowIcon}>
                    {showOptions ? "▲" : "▼"}
                  </span>
                </button>
              </div>

              {showSolutionForm && (
                <div className={styles.solutionForm}>
                  <h3>
                    {selectedOption === "solucion"
                      ? "Agregar Solución"
                      : "Agregar Seguimiento"}
                  </h3>

                  <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <label>Descripción:</label>
                      <textarea
                        className={styles.textarea}
                        placeholder={
                          selectedOption === "solucion"
                            ? "Describa la solución al problema..."
                            : "Agregue detalles del seguimiento..."
                        }
                        value={solutionFormData.descripcion}
                        onChange={(e) =>
                          setSolutionFormData({
                            ...solutionFormData,
                            descripcion: e.target.value,
                          })
                        }
                        rows="5"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Archivos adjuntos:</label>
                      <input
                        type="file"
                        multiple
                        onChange={handleSolutionFileChange}
                        className={styles.fileInput}
                      />
                      {solutionFormData.archivos.length > 0 && (
                        <div className={styles.fileList}>
                          <strong>Archivos seleccionados:</strong>
                          <ul>
                            {solutionFormData.archivos.map((file, index) => (
                              <li key={index} className={styles.fileItem}>
                                {file.name}
                                <button
                                  type="button"
                                  onClick={() => removeSolutionFile(index)}
                                  className={styles.removeFileButton}
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className={styles.formActions}>
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                      >
                        {isLoading ? "Procesando..." : "Guardar"}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => {
                          setShowSolutionForm(false);
                          setSolutionFormData({
                            descripcion: "",
                            archivos: [],
                          });
                        }}
                        disabled={isLoading}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Columna derecha - Opciones del ticket */}
            <div className={styles.optionsContainer}>
              <h3>Opciones del Ticket</h3>

              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Casos</label>
                <div className={styles.optionContent}>
                  <Link
                    to="/tickets/solucion/:id"
                    className={styles.optionLink}
                  >
                    Caso Actual
                  </Link>
                </div>
              </div>

              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>
                  Encuesta de satisfacción
                </label>
                <div className={styles.optionContent}>
                  <Link
                    to="/EncuestaSatisfaccion/:surveyId"
                    className={styles.optionLink}
                  >
                    Encuesta
                  </Link>
                </div>
              </div>

              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Histórico</label>
                <div className={styles.optionContent}>
                  <Link
                    to={`/tickets/${ticket.id}/historial`}
                    className={styles.optionLink}
                  >
                    <FaHistory /> Historial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Operación Exitosa</h3>
              <button 
                onClick={handleCloseSuccessModal} 
                className={styles.modalCloseButton}
              >
                &times;
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
                </svg>
              </div>
              <p>{modalMessage}</p>
              
              <div className={styles.modalActions}>
                <button
                  onClick={handleCloseSuccessModal}
                  className={styles.modalButton}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de error */}
      {showErrorModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Error</h3>
              <button 
                onClick={handleCloseErrorModal} 
                className={styles.modalCloseButton}
              >
                &times;
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.errorIcon}>
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                </svg>
              </div>
              <p>{modalMessage}</p>
              
              <div className={styles.modalActions}>
                <button
                  onClick={handleCloseErrorModal}
                  className={styles.modalButtonError}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ChatBot />
    </MenuVertical>
  );
};

export default SolucionTickets;