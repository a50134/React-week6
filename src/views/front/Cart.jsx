import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../hooks/useToast";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Cart() {
  const [cart, setCart] = useState([]);
  const { toast } = useToast();
  useEffect(() => {
    const getCart = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
        setCart(response.data.data);
        console.log("購物車資料:", response.data.data);
      } catch (error) {
        console.error("獲取購物車資料失敗:", error);
      }
    };

    getCart();
  }, []);

  if (!cart) {
    return (
      <div className="container">
        <h2>購物車列表</h2>
        <p>載入中或尚無購物車資料...</p>
      </div>
    );
  }

  // 更新商品數量
  const updateCart = async (cartId, productId, qty = 1) => {
    try {
      const data = {
        product_id: productId,
        qty,
      };
      await axios.put(`${API_BASE}/api/${API_PATH}/cart/${cartId}`, { data });
      const response = await axios.put(
        `${API_BASE}/api/${API_PATH}/cart/${cartId}`,
        { data },
      );

      setCart(response.data.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 刪除購物車項目
  const deleteCart = async (cartId) => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${cartId}`, {
        data: { id: cartId },
      });
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/cart/${cartId}`,
        { data: { id: cartId } },
      );

      setCart(response.data.data);
      toast.success("商品已從購物車中移除", { loading: true });
    } catch (error) {
      console.log(error.response.data);
    }
  };

  return (
    <div className="container">
      <h2>購物車列表</h2>
      <div className="text-end mt-4">
        <button type="button" className="btn btn-outline-danger">
          清空購物車
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">品名</th>
            <th scope="col">數量/單位</th>
            <th scope="col">小計</th>
          </tr>
        </thead>
        <tbody>
          {cart?.carts?.map((cartItem) => (
            <tr key={cartItem.id}>
              <td>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => deleteCart(cartItem.id)}
                >
                  刪除
                </button>
              </td>
              <th scope="row">{cartItem.product.title}</th>
              <td>
                <div className="input-group input-group-sm mb-3">
                  <input
                    type="number"
                    className="form-control"
                    aria-label="Sizing example input"
                    aria-describedby="inputGroup-sizing-sm"
                    defaultValue={cartItem.qty}
                    onChange={(e) =>
                      updateCart(
                        cartItem.id,
                        cartItem.product.id,
                        Number(e.target.value),
                      )
                    }
                  />
                  <span className="input-group-text" id="inputGroup-sizing-sm">
                    {cartItem.product.unit}
                  </span>
                </div>
              </td>
              <td className="text-end">{cartItem.total}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="text-end" colSpan="3">
              總計${cart.final_total}
            </td>
            <td className="text-end"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default Cart;
