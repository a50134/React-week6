import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../hooks/useToast";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { toast } = useToast();
  useEffect(() => {
    const handleView = async (id) => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/${API_PATH}/product/${id}`,
        );
        console.log(response.data.product);
        setProduct(response.data.product);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    handleView(id);
  }, [id]);

  //  const location = useLocation();
  //  const product = location.state?.productData.product;
  if (!product) {
    return <div>沒有可用的產品資料。</div>;
  }

  const addCart = async (id, qty = 1) => {
    try {
      const data = {
        product_id: id,
        qty,
      };
      const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
        data,
      });
      toast.success("商品列表載入成功", { loading: true });
    } catch (error) {
      toast.error("加入購物車失敗", { loading: true });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card" style={{ width: "18rem" }}>
        <img
          src={product.imageUrl}
          className="card-img-top"
          alt={product.title}
        />
        <div className="card-body">
          <h5 className="card-title">{product.title}</h5>
          <p className="card-text">{product.description}</p>
          <p className="card-text">
            <strong>分類:</strong> {product.category}
          </p>
          <p className="card-text">
            <strong>單位:</strong> {product.unit}
          </p>
          <p className="card-text">
            <strong>原價:</strong> {product.origin_price} 元
          </p>
          <p className="card-text">
            <strong>現價:</strong> {product.price} 元
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => addCart(product.id)}
          >
            加入購物車
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;
