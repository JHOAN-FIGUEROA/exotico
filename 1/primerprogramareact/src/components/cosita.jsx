import React, { useState, useEffect } from "react";
import Alert from './Alert.jsx';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/Tables.css';
import apiClient from '../services/apiClient.js';  // Ajusta la ruta según la ubicación de tu archivo apiClient

const TablaCompras = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  
  const [form, setForm] = useState({
    producto: "",   // Cambiado de nombre a producto
    precio: "",
    cantidad: "",
    proveedor: "",
    fecha: "",
    total: 0,
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [alert, setAlert] = useState({ message: '', show: false, type: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productosResponse = await apiClient.get('/productos');
        const proveedoresResponse = await apiClient.get('/proveedores');
        const comprasResponse = await apiClient.get('/compras');
        
        setProductos(productosResponse.data);
        setProveedores(proveedoresResponse.data);
        setData(comprasResponse.data);
      } catch (error) {
        console.error("Error al obtener productos, proveedores o compras:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => {
      const newValue = name === "cantidad" || name === "precio"
        ? (name === "cantidad"
            ? Number(value) * prevForm.precio
            : prevForm.cantidad * Number(value)
          )
        : prevForm.total;

      return {
        ...prevForm,
        [name]: value,
        total: newValue,
      };
    });
  };

  const handleProveedorChange = (e) => {
    setForm((prevForm) => ({
      ...prevForm,
      proveedor: e.target.value,
    }));
  };

  const showAlert = (message, type) => {
    setAlert({ message, show: true, type });
    setTimeout(() => setAlert({ ...alert, show: false }), 3000);
  };

  const handleSubmit = async () => {
    try {
      const requestBody = {
        ...form,
        fecha: new Date(form.fecha).toISOString(), // Asegúrate de que la fecha esté en formato ISO
      };

      if (editingIndex !== null) {
        const updatedData = [...data];
        const itemToUpdate = updatedData[editingIndex];
        await apiClient.put(`/compras/${itemToUpdate._id}`, requestBody);
        updatedData[editingIndex] = { ...requestBody, _id: itemToUpdate._id }; // Actualiza el _id existente
        setData(updatedData);
        setEditingIndex(null);
        showAlert("Registro actualizado correctamente.", 'success');
      } else {
        // Asumiendo que el backend generará `compra_id`
        await apiClient.post('/compras', requestBody);
        setData([...data, requestBody]); // Usa el nuevo registro
        showAlert("Registro agregado correctamente.", 'success');
      }

      setForm({ producto: "", precio: "", cantidad: "", proveedor: "", fecha: "", total: 0 });
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      showAlert("Error al procesar la compra", 'error');
    }
  };

  const handleEdit = (index) => {
    setForm(data[index]);
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    try {
      const itemToDelete = data[index];
      await apiClient.delete(`/compras/${itemToDelete._id}`);
      setData(data.filter((_, i) => i !== index));
      showAlert("Registro eliminado correctamente.", 'success');
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      showAlert("Error al eliminar el registro", 'error');
    }
  };

  const handleAnular = async (index) => {
    try {
      const updatedData = [...data];
      updatedData[index].anulado = true;
      await apiClient.put(`/compras/${updatedData[index]._id}`, updatedData[index]);
      setData(updatedData);
      showAlert("Registro anulado correctamente.", 'success');
    } catch (error) {
      console.error("Error al anular el registro:", error);
      showAlert("Error al anular el registro", 'error');
    }
  };

  const filteredData = data.filter(
    (row) =>
      row.producto.toLowerCase().includes(filter.toLowerCase()) ||
      row.cantidad.toString().includes(filter.toLowerCase()) ||
      row.precio.toString().includes(filter.toLowerCase()) ||
      proveedores.find(p => p.nombre === row.proveedor)?.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      new Date(row.fecha).toLocaleDateString().includes(filter.toLowerCase())
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
      {alert.show && <Alert message={alert.message} type={alert.type} />}
      <h2>Tabla de Compras</h2>

      <h3>{editingIndex !== null ? "Editar" : "Agregar"} Registro</h3>
      <select
        name="producto" // Cambiado de nombre a producto
        value={form.producto}
        onChange={handleChange}
      >
        <option value="">Seleccione un producto</option>
        {productos.map((producto) => (
          <option key={producto._id} value={producto.nombre}>
            {producto.nombre}
          </option>
        ))}
      </select>

      <input
        type="number"
        name="cantidad"
        placeholder="Cantidad"
        value={form.cantidad}
        onChange={handleChange}
      />
      <input
        type="number"
        name="precio"
        placeholder="Precio Unitario"
        value={form.precio}
        onChange={handleChange}
      />
      
      <select
        name="proveedor"
        value={form.proveedor}
        onChange={handleProveedorChange}
      >
        <option value="">Seleccione un proveedor</option>
        {proveedores.map((proveedor) => (
          <option key={proveedor._id} value={proveedor.nombre}>
            {proveedor.nombre}
          </option>
        ))}
      </select>
      
      <input
        type="date"
        name="fecha"
        placeholder="Fecha"
        value={form.fecha}
        onChange={handleChange}
      />
      <input
        type="number"
        name="total"
        placeholder="Total"
        value={form.total}
        readOnly
      />

      <button onClick={handleSubmit}>
        {editingIndex !== null ? "Actualizar" : "Agregar"}
      </button>

      <input
        type="text"
        placeholder="Filtrar por producto, cantidad, precio, proveedor o fecha"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <table className="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Anulado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row, index) => (
            <tr key={row._id}>
              <td>{row._id}</td>
              <td>{row.producto}</td> {/* Cambiado de nombre a producto */}
              <td>{row.cantidad}</td>
              <td>{row.precio}</td>
              <td>{row.proveedor}</td>
              <td>{new Date(row.fecha).toLocaleDateString()}</td>
              <td>{row.total}</td>
              <td>{row.anulado ? 'Sí' : 'No'}</td>
              <td>
                <EditIcon onClick={() => handleEdit(index)} />
                <DeleteIcon onClick={() => handleDelete(index)} />
                {!row.anulado && <button onClick={() => handleAnular(index)}>Anular</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={index + 1 === currentPage ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TablaCompras;
