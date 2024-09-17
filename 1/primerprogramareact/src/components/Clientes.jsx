import React, { useState, useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '../components/Alert.jsx'; 
import apiClient from '../services/apiClient'; 
import '../styles/Tables.css';

const TablaClientes = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const [alert, setAlert] = useState({ message: '', show: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/clientes');
        setData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    let errors = {};
    if (!form.nombre) errors.nombre = "El nombre es requerido.";
    if (!form.apellido) errors.apellido = "El apellido es requerido.";
    if (!form.correo || !/\S+@\S+\.\S+/.test(form.correo)) 
      errors.correo = "El correo es inválido.";
    if (!form.telefono || !/^\d{10}$/.test(form.telefono)) 
      errors.telefono = "El teléfono debe ser un número de 10 dígitos.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showAlert = (message) => {
    setAlert({ message, show: true });
    setTimeout(() => setAlert({ ...alert, show: false }), 3000); 
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingIndex !== null) {
        // Actualizar cliente existente
        const clienteId = data[editingIndex]._id;
        const response = await apiClient.put(`/clientes/${clienteId}`, form);
        const updatedData = [...data];
        updatedData[editingIndex] = response.data;
        setData(updatedData);
        setEditingIndex(null);
        showAlert("El registro ha sido actualizado.");
      } else {
        // Crear nuevo cliente
        const response = await apiClient.post('/clientes', form);
        setData([...data, response.data]);
        showAlert("El nuevo registro ha sido agregado.");
      }
      setForm({ nombre: "", apellido: "", correo: "", telefono: "" });
      setErrors({});
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      showAlert("Error al guardar el registro.");
    }
  };

  const handleEdit = (index) => {
    setForm(data[index]);
    setEditingIndex(index);
    setErrors({});
  };

  const handleDelete = async (index) => {
    try {
      const clienteId = data[index]._id;
      await apiClient.delete(`/clientes/${clienteId}`);  
      const updatedData = data.filter((_, i) => i !== index);
      setData(updatedData);
      showAlert("El registro ha sido eliminado.");
    } catch (error) {
      console.error('Error al eliminar los datos:', error);
      showAlert("Error al eliminar el registro.");
    }
  };

  const filteredData = data.filter(
    (row) =>
      row.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      row.correo.toLowerCase().includes(filter.toLowerCase()) ||
      row.telefono.toLowerCase().includes(filter.toLowerCase()) ||
      row.apellido.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="Contenedor">
      {alert.show && <Alert message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />}
      <h2>Tabla de Clientes</h2>
      <input
        type="text"
        placeholder="Buscar"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      
      <h3>{editingIndex !== null ? "Editar" : "Agregar"} Registro</h3>
      <div>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del Cliente"
          value={form.nombre}
          onChange={handleChange}
        />
        {errors.nombre && <p className="error">{errors.nombre}</p>}
      </div>
      <div>
        <input
          type="text"
          name="apellido"
          placeholder="Apellido del Cliente"
          value={form.apellido}
          onChange={handleChange}
        />
        {errors.apellido && <p className="error">{errors.apellido}</p>}
      </div>
      <div>
        <input
          type="email"
          name="correo"
          placeholder="Correo Electrónico"
          value={form.correo}
          onChange={handleChange}
        />
        {errors.correo && <p className="error">{errors.correo}</p>}
      </div>
      <div>
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono (10 dígitos)"
          value={form.telefono}
          onChange={handleChange}
        />
        {errors.telefono && <p className="error">{errors.telefono}</p>}
      </div>
      <button onClick={handleSubmit}>
        {editingIndex !== null ? "Actualizar" : "Agregar"}
      </button>

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row, index) => (
            <tr key={row._id}>
              <td>{row.nombre}</td>
              <td>{row.apellido}</td>
              <td>{row.correo}</td>
              <td>{row.telefono}</td>
              <td>
                <button onClick={() => handleEdit(indexOfFirstItem + index)}><EditIcon /></button>
                <button onClick={() => handleDelete(indexOfFirstItem + index)}><DeleteIcon /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-button ${currentPage === index + 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TablaClientes;