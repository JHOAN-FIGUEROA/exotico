import React, { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '../components/Alert.jsx'; 
import '../styles/Tables.css';

const TablaVentas = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    producto: "",
    cantidad: "",
    precioUnitario: "",
    fecha: "",
    anulado: false,  
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ message: "", show: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const showAlert = (message) => {
    setAlert({ message, show: true });
    setTimeout(() => setAlert({ ...alert, show: false }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    let errors = {};
    if (!form.producto) errors.producto = "El producto es requerido.";
    if (!form.cantidad || isNaN(form.cantidad) || form.cantidad <= 0) 
      errors.cantidad = "La cantidad debe ser un número positivo.";
    if (!form.precioUnitario || isNaN(form.precioUnitario) || form.precioUnitario <= 0) 
      errors.precioUnitario = "El precio unitario debe ser un número positivo.";
    if (!form.fecha) errors.fecha = "La fecha es requerida.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingIndex !== null) {
      const updatedData = [...data];
      updatedData[editingIndex] = form;
      setData(updatedData);
      setEditingIndex(null);
      showAlert("El registro ha sido actualizado.");
    } else {
      setData([...data, { ...form, id: Date.now().toString() }]);
      showAlert("El nuevo registro ha sido agregado.");
    }
    setForm({ producto: "", cantidad: "", precioUnitario: "", fecha: "", anulado: false });
    setErrors({});
  };

  const handleEdit = (index) => {
    setForm(data[index]);
    setEditingIndex(index);
    setErrors({});
  };

  const handleDelete = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
    showAlert("El registro ha sido eliminado.");
  };

  const handleAnular = (index) => {
    const updatedData = [...data];
    updatedData[index].anulado = true;  
    setData(updatedData);
    showAlert("El registro ha sido anulado.");
  };

  const filteredData = data.filter(
    (row) =>
      row.producto.toLowerCase().includes(filter.toLowerCase()) ||
      row.cantidad.toString().includes(filter.toLowerCase()) ||
      row.precioUnitario.toString().includes(filter.toLowerCase()) ||
      row.fecha.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="Contenedor">
      <h2>Tabla de Ventas</h2>

      {alert.show && <Alert message={alert.message} />} {/* Mostrar alerta */}

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
          name="producto"
          placeholder="Producto"
          value={form.producto}
          onChange={handleChange}
        />
        {errors.producto && <p className="error">{errors.producto}</p>}
      </div>
      <div>
        <input
          type="number"
          name="cantidad"
          placeholder="Cantidad"
          value={form.cantidad}
          onChange={handleChange}
        />
        {errors.cantidad && <p className="error">{errors.cantidad}</p>}
      </div>
      <div>
        <input
          type="number"
          name="precioUnitario"
          placeholder="Precio Unitario"
          value={form.precioUnitario}
          onChange={handleChange}
        />
        {errors.precioUnitario && <p className="error">{errors.precioUnitario}</p>}
      </div>
      <div>
        <input
          type="date"
          name="fecha"
          placeholder="Fecha"
          value={form.fecha}
          onChange={handleChange}
        />
        {errors.fecha && <p className="error">{errors.fecha}</p>}
      </div>
      <button onClick={handleSubmit}>
        {editingIndex !== null ? "Actualizar" : "Agregar"}
      </button>

      <table className="tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Fecha</th>
            <th>Anulado</th> 
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row, index) => (
            <tr key={row.id}>
              <td>{row.producto}</td>
              <td>{row.cantidad}</td>
              <td>{row.precioUnitario}</td>
              <td>{row.fecha}</td>
              <td>{row.anulado ? "Sí" : "No"}</td> 
              <td>
                <button onClick={() => handleEdit(indexOfFirstItem + index)} disabled={row.anulado}><EditIcon /></button>
                <button onClick={() => handleDelete(indexOfFirstItem + index)} disabled={row.anulado}><DeleteIcon /></button>
                <button onClick={() => handleAnular(indexOfFirstItem + index)} disabled={row.anulado}>
                  {row.anulado ? "Anulado" : "Anular"}
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
            className={`page-button ${currentPage === index + 1 ? "active" : ""}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TablaVentas;