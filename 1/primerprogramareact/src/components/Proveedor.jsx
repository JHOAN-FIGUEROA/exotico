import React, { useState, useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '../components/Alert.jsx'; 
import apiClient from '../services/apiClient'; 
import '../styles/Tables.css';

const TablaProveedores = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    compras: []
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [alert, setAlert] = useState({ message: '', show: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/proveedores');
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
    if (!form.correo || !/\S+@\S+\.\S+/.test(form.correo)) errors.correo = "El email es inválido.";
    if (!form.telefono || !/^\d{10}$/.test(form.telefono)) errors.telefono = "El teléfono debe ser un número de 10 dígitos.";
    if (!form.direccion) errors.direccion = "La dirección es requerida.";

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
        console.log("Editing provider ID:", data[editingIndex]._id);
        await apiClient.put(`/proveedores/${data[editingIndex]._id}`, form);
        const updatedData = [...data];
        updatedData[editingIndex] = form;
        setData(updatedData);
        setEditingIndex(null);
        showAlert("El registro ha sido actualizado.");
      } else {
        await apiClient.post('/proveedores', form);
        setData([...data, form]);
        showAlert("El nuevo registro ha sido agregado.");
      }
      setForm({ nombre: "", apellido: "", correo: "", telefono: "", direccion: "", compras: [] });
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
      console.log("Deleting provider ID:", data[index]._id);
      await apiClient.delete(`/proveedores/${data[index]._id}`);
      const updatedData = data.filter((_, i) => i !== index);
      setData(updatedData);
      showAlert("El registro ha sido eliminado.");
    } catch (error) {
      console.error('Error al eliminar los datos:', error);
      showAlert("Error al eliminar el registro.");
    }
  };

  const handleInactivar = async (index) => {
    try {
      const updatedProveedor = { ...data[index], inactivo: true };
      await apiClient.put(`/proveedores/${data[index]._id}`, updatedProveedor);
      const updatedData = [...data];
      updatedData[index].inactivo = true;
      setData(updatedData);
      showAlert("El registro ha sido inactivado.");
    } catch (error) {
      console.error('Error al inactivar el registro:', error);
      showAlert("Error al inactivar el registro.");
    }
  };

  const filteredData = data.filter(
    (row) =>
      row.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      row.empresa.toLowerCase().includes(filter.toLowerCase()) ||
      row.contacto.toLowerCase().includes(filter.toLowerCase()) ||
      row.email.toLowerCase().includes(filter.toLowerCase()) ||
      row.fechaRegistro.toLowerCase().includes(filter.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="Contenedor">
      {alert.show && <Alert message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />}
      <h2>Tabla de Proveedores</h2>
      <input
        type="text"
        placeholder="Buscar"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <h3>{editingIndex !== null ? "Editar" : "Agregar"} Proveedor</h3>
      <div>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del Proveedor"
          value={form.nombre}
          onChange={handleChange}
        />
        {errors.nombre && <p className="error">{errors.nombre}</p>}
      </div>
      <div>
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
        />
        {errors.apellido && <p className="error">{errors.apellido}</p>}
      </div>
      <div>
        <input
          type="email"
          name="correo"
          placeholder="Email"
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
      <div>
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
        />
        {errors.direccion && <p className="error">{errors.direccion}</p>}
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
            <th>Dirección</th>
            <th>Inactivo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={row._id}>
              <td>{row.nombre}</td>
              <td>{row.apellido}</td>
              <td>{row.correo}</td>
              <td>{row.telefono}</td>
              <td>{row.direccion}</td>
              <td>{row.inactivo ? "Sí" : "No"}</td>
              <td>
                <button onClick={() => handleEdit(startIndex + index)} disabled={row.inactivo}><EditIcon /></button>
                <button onClick={() => handleDelete(startIndex + index)} disabled={row.inactivo}><DeleteIcon /></button>
                <button onClick={() => handleInactivar(startIndex + index)} disabled={row.inactivo}>
                  {row.inactivo ? "Inactivo" : "Inactivar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-button ${index + 1 === currentPage ? 'active' : ''}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TablaProveedores;
