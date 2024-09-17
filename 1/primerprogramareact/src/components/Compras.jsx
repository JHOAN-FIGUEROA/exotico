import React, { useState, useEffect } from "react";
import Alert from '../components/Alert.jsx';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/Tables.css';
import apiClient from '../services/apiClient';  // Ajusta la ruta según la ubicación de tu archivo apiClient

const TablaCompras = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  
  const [form, setForm] = useState({
    producto: "",   // Cambiado de nombre a producto
    productoId: "", // ID del producto
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

  const handleProductoChange = (e) => {
    const selectedProducto = productos.find(p => p.nombre === e.target.value);
    setForm((prevForm) => ({
      ...prevForm,
      producto: e.target.value,
      productoId: selectedProducto ? selectedProducto._id : "",
      precio: selectedProducto ? selectedProducto.precio : "",
    }));
  };

  const showAlert = (message, type) => {
    setAlert({ message, show: true, type });
    setTimeout(() => setAlert({ ...alert, show: false }), 3000);
  };

  const handleSubmit = async () => {
    try {
      // Validar la fecha
      const fechaISO = new Date(form.fecha).toISOString();
      if (isNaN(new Date(fechaISO).getTime())) {
        throw new Error('Fecha inválida');
      }

      const requestBody = {
        ...form,
        fecha: fechaISO, // Asegúrate de que la fecha esté en formato ISO
      };

      if (editingIndex !== null) {
        // Actualizar una compra existente
        const updatedData = [...data];
        const itemToUpdate = updatedData[editingIndex];
        await apiClient.put(`/compras/${itemToUpdate._id}`, requestBody);
        updatedData[editingIndex] = { ...requestBody, _id: itemToUpdate._id }; // Actualiza el _id existente
        setData(updatedData);
        setEditingIndex(null);

        // Actualizar la cantidad del producto
        const oldCompra = data[editingIndex];
        await apiClient.put(`/productos/${oldCompra.productoId}`, {
          cantidad: productos.find(p => p._id === oldCompra.productoId).cantidad - oldCompra.cantidad + requestBody.cantidad
        });

        showAlert("Registro actualizado correctamente.", 'success');
      } else {
        // Agregar una nueva compra
        const response = await apiClient.post('/compras', requestBody);
        const newCompra = response.data;

        // Actualizar la cantidad del producto
        await apiClient.put(`/productos/${form.productoId}`, {
          cantidad: productos.find(p => p._id === form.productoId).cantidad + form.cantidad
        });

        setData([...data, newCompra]); // Usa el nuevo registro
        showAlert("Registro agregado correctamente.", 'success');
      }

      setForm({ producto: "", productoId: "", precio: "", cantidad: "", proveedor: "", fecha: "", total: 0 });
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

      // Restar la cantidad del producto
      await apiClient.put(`/productos/${itemToDelete.productoId}`, {
        cantidad: productos.find(p => p._id === itemToDelete.productoId).cantidad - itemToDelete.cantidad
      });

      setData(data.filter((_, i) => i !== index));
      showAlert("Registro eliminado correctamente.", 'success');
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      showAlert("Error al eliminar el registro", 'error');
    }
  };

  const handleAnular = async (index) => {
    try {
      const compraAnulada = data[index];
      
      if (!compraAnulada) {
        throw new Error('Compra no encontrada');
      }

      const producto = productos.find(p => p._id === compraAnulada.productoId);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Restar la cantidad del producto
      await apiClient.put(`/productos/${producto._id}`, {
        cantidad: producto.cantidad - compraAnulada.cantidad
      });

      // Actualizar la compra para marcarla como anulada
      await apiClient.put(`/compras/${compraAnulada._id}`, {
        ...compraAnulada,
        anulado: true
      });

      // Actualizar el estado con los datos modificados
      const updatedData = [...data];
      updatedData[index].anulado = true;
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
        onChange={handleProductoChange}
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
        placeholder="Buscar..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Total</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={item._id}>
              <td>{item.producto}</td>
              <td>{item.cantidad}</td>
              <td>{item.precio}</td>
              <td>{item.total}</td>
              <td>{proveedores.find(p => p.nombre === item.proveedor)?.nombre}</td>
              <td>{new Date(item.fecha).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEdit(index)}>
                  <EditIcon />
                </button>
                <button onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </button>
                <button onClick={() => handleAnular(index)}>
                  Anular
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TablaCompras;
