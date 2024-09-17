import React, { useState, useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import '../styles/Tables.css';
import apiClient from '../services/apiClient';

const TablaProductos = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    _id: "",
    nombre: "",
    descripcion: "",
    precio: 0,
    cantidad: 0,
    tipo: "",
  });
  const [errors, setErrors] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/productos');
        setData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "precio" || name === "cantidad" ? parseFloat(value) || 0 : value });
  };

  const validateForm = () => {
    let errors = {};
    if (!form.nombre) errors.nombre = "El nombre del producto o servicio es requerido.";
    if (!form.descripcion) errors.descripcion = "La descripción es requerida.";
    if (form.precio <= 0 || isNaN(form.precio)) 
      errors.precio = "El precio debe ser un número positivo.";
    if (form.cantidad <= 0 || isNaN(form.cantidad))
      errors.cantidad = "La cantidad debe ser un número positivo.";
    if (!form.tipo || !['Producto', 'Servicio'].includes(form.tipo)) 
      errors.tipo = "El tipo es requerido y debe ser 'Producto' o 'Servicio'.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const { _id, ...productData } = form; // Excluye _id
      if (editingIndex !== null) {
        // Actualizar producto o servicio existente
        await apiClient.put(`/productos/${_id}`, productData);
        const updatedData = [...data];
        updatedData[editingIndex] = { ...form, ...productData };
        setData(updatedData);
        setEditingIndex(null);
      } else {
        // Crear nuevo producto o servicio
        const response = await apiClient.post('/productos', productData);
        setData([...data, response.data]);
      }
      setForm({ _id: "", nombre: "", descripcion: "", precio: 0, cantidad: 0, tipo: "" });
      setErrors({});
    } catch (error) {
      console.error('Error al guardar los datos:', error.response ? error.response.data : error.message);
    }
  };

  const handleEdit = (index) => {
    setForm(data[index]);
    setEditingIndex(index);
    setErrors({});
  };

  const handleDelete = async (index) => {
    try {
      await apiClient.delete(`/productos/${data[index]._id}`);
      const updatedData = data.filter((_, i) => i !== index);
      setData(updatedData);
    } catch (error) {
      console.error('Error al eliminar los datos:', error.response ? error.response.data : error.message);
    }
  };

  const filteredData = data.filter(
    (row) =>
      row.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      row.descripcion.toLowerCase().includes(filter.toLowerCase()) ||
      row.precio.toString().toLowerCase().includes(filter.toLowerCase()) ||
      row.cantidad.toString().toLowerCase().includes(filter.toLowerCase()) ||
      row.tipo.toLowerCase().includes(filter.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="Contenedor">
      <h2>Tabla de Productos/Servicios</h2>
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
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
        />
        {errors.nombre && <p className="error">{errors.nombre}</p>}
      </div>
      <div>
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        {errors.descripcion && <p className="error">{errors.descripcion}</p>}
      </div>
      <div>
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={form.precio || 0}
          onChange={handleChange}
        />
        {errors.precio && <p className="error">{errors.precio}</p>}
      </div>
      <div>
        <input
          type="number"
          name="cantidad"
          placeholder="Cantidad"
          value={form.cantidad || 0}
          onChange={handleChange}
        />
        {errors.cantidad && <p className="error">{errors.cantidad}</p>}
      </div>
      <div>
        <select
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
        >
          <option value="">Seleccione tipo</option>
          <option value="Producto">Producto</option>
          <option value="Servicio">Servicio</option>
        </select>
        {errors.tipo && <p className="error">{errors.tipo}</p>}
      </div>
      <button onClick={handleSubmit}>
        {editingIndex !== null ? "Actualizar" : "Agregar"}
      </button>

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={row._id}>
              <td>{row.nombre}</td>
              <td>{row.descripcion}</td>
              <td>{row.precio}</td>
              <td>{row.cantidad}</td>
              <td>{row.tipo}</td>
              <td>
                <button onClick={() => handleEdit(startIndex + index)}><EditIcon /></button>
                <button onClick={() => handleDelete(startIndex + index)}><DeleteIcon /></button>
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

export default TablaProductos;
