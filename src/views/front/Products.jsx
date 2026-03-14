import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/${API_PATH}/products`
        );
        // 保險：確保一定是陣列
        const productList = response.data?.products;
        if (Array.isArray(productList)) {
          setProducts(productList);
        } else {
          console.warn("products 不是陣列或為 undefined：", productList);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };

    getProducts();
  }, []);

  const handleView = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="container">
      <div className="row">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <div className="col-md-4 mb-3" key={product.id}>
              <div className="card">
                <img
                  src={product.imageUrl}
                  className="card-img-top"
                  alt={product.title}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.title}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="card-text">價格${product.price}</p>
                  <p className="card-text">
                    <small className="text-body-secondary">
                      {product.unit}
                    </small>
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleView(product.id)}
                  >
                    查看更多
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            目前沒有商品可顯示
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
