import { Link } from 'react-router-dom'

/* ──────────────────────────────────────────────
   Tarjeta de producto: imagen, precio y categoría
   anidada que viene en la misma respuesta del API.
   ────────────────────────────────────────────── */

export default function ProductCard({ product, onDelete, isDeleting }) {
  const image = product.image_url || product.image
  const price = Number(product.price || 0).toFixed(2)

  return (
    <article className="product-card">
      {image ? (
        <img className="product-image" src={image} alt={product.name} />
      ) : (
        <div className="product-image product-image--empty">Sin imagen</div>
      )}

      <div className="product-body">
        <h2>{product.name}</h2>
        <p className="product-description">{product.description || 'Sin descripción.'}</p>

        <p className="product-category">
          <strong>{product.category?.name || 'Sin categoría'}</strong>
          <span>{product.category?.description}</span>
        </p>

        <div className="product-meta">
          <span className="product-price">S/ {price}</span>
          <span className="product-stock">{product.stock} en stock</span>
        </div>

        <div className="product-actions">
          <Link className="btn-primary" to={`/products/${product.id}/edit`}>
            Editar
          </Link>
          <button
            className="btn-danger"
            onClick={() => onDelete(product.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Borrando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </article>
  )
}
