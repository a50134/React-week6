import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { RotatingLines } from "react-loader-spinner";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Checkout() {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadingProductId, setLoadingProductsId] = useState(null);
  const [modalQty, setModalQty] = useState(1);

  const productModalRef = useRef(null);
  const checkoutRef = useRef(null); // 用來捲到結帳區

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
  });

  // 抓購物車
  const getCart = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(res.data.data);
    } catch (error) {
      const messages = error.response?.data?.message;
      toast.error(
        Array.isArray(messages)
          ? messages.join(", ")
          : messages || "購物車載入失敗"
      );
    }
  };

  // 抓產品列表
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/products`
      );
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("產品列表載入失敗");
    }
  };

  // 第一次載入就打 API
  useEffect(() => {
    const initializeCheckout = async () => {
      await getCart();
      await getProducts();
    };
    initializeCheckout();
  }, []);

  // 專門負責初始化 Bootstrap Modal
  useEffect(() => {
    const modalElement = document.getElementById("productModal");
    if (!modalElement) {
      console.error("找不到 #productModal");
      return;
    }

    productModalRef.current = new bootstrap.Modal(modalElement, {
      keyboard: false,
    });

    const handleHide = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    modalElement.addEventListener("hide.bs.modal", handleHide);

    return () => {
      modalElement.removeEventListener("hide.bs.modal", handleHide);
      productModalRef.current?.dispose?.();
    };
  }, []);

  // 加入購物車
const addCart = async (productId, qty = 1) => {
  try {
    setLoadingCartId(productId);
    const data = {
      product_id: productId,
      qty,
    };
    await axios.post(
      `${API_BASE}/api/${API_PATH}/cart`,
      { data }
    );
    toast.success("已加入購物車");
    setLoadingCartId(null);
    await getCart();

    // 如果是從查看更多的 Modal 來的，關閉 Modal
    if (productModalRef.current) {
      productModalRef.current.hide();
    }

    // 成功後捲動到結帳區
    checkoutRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    setLoadingCartId(null);
    toast.error("加入購物車失敗", error.response?.data || error);
  };
};

  
  // 更新購物車數量
  const updateCart = async (cartId, productId, qty = 1) => {
    try {
      const data = {
        product_id: productId,
        qty,
      };

      await axios.put(
        `${API_BASE}/api/${API_PATH}/cart/${cartId}`,
        { data }
      );

      await getCart();
    } catch (error) {
      console.log(error.response?.data || error);
      toast.error("更新購物車失敗");
    }
  };

  // 刪除購物車項目
  const deleteCart = async (cartId) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/cart/${cartId}`,
        { data: { id: cartId } }
      );
      setCart(response.data.data);
      toast.success("已刪除品項");
    } catch (error) {
      console.log(error.response?.data || error);
      toast.error("刪除失敗");
    }
  };

  // 清空購物車
  const clearCart = async () => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/carts`
      );
      setCart(res.data.data);
      toast.success("購物車已清空");
    } catch (error) {
      console.error("清空購物車失敗:", error);
      toast.error("清空購物車失敗");
    }
  };

  // 送出訂單
  const onSubmit = async (formData) => {
    if (!cart?.carts || cart.carts.length === 0) {
      toast.error("購物車是空的，不能送出訂單喔！");
      return;
    }

    const { message = "", ...user } = formData;

    const payload = {
      data: {
        user: user,
        message: message,
      },
    };

    try {
      const res = await axios.post(
        `${API_BASE}/api/${API_PATH}/order`,
        payload
      );

      if (res.data.success) {
        toast.success("訂單建立成功！");
        reset();
        getCart();
        alert(`訂單編號：${res.data.orderId}\n感謝您的購買！`);
      }
    } catch (error) {
      console.error("API 回傳錯誤細節:", error.response?.data);
      toast.error(error.response?.data?.message || "建立訂單失敗");
    }
  };

  return (
    <>
      <div className="container mt-5">
        {/* 產品詳情 Modal */}
        <div className="modal" id="productModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  產品名稱：{product?.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {product && (
                  <>
                    <img
                      className="w-100"
                      src={product.imageUrl}
                      alt={product.title}
                    />
                    <p className="mt-3">產品內容：{product.content}</p>
                    <p>產品描述：{product.description}</p>
                    <p>
                      價錢：
                      <del>原價 ${product.origin_price}</del>，特價：
                      ${product.price}
                    </p>

                    {/* 數量調整區 */}
                    <div className="d-flex align-items-center mt-3">
                      <label style={{ width: "80px" }} className="me-2">
                        數量：
                      </label>
                      <div className="input-group" style={{ maxWidth: "220px" }}>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() =>
                            setModalQty((prev) => Math.max(1, prev - 1))
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          min="1"
                          max="10"
                          value={modalQty}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!Number.isNaN(value)) {
                              setModalQty(
                                Math.min(10, Math.max(1, value))
                              );
                            }
                          }}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() =>
                            setModalQty((prev) => Math.min(10, prev + 1))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => product && addCart(product.id, modalQty)}
                  disabled={!product}
                >
                  加入購物車
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 產品列表 */}
        <table className="table align-middle">
          <thead>
            <tr>
              <th>圖片</th>
              <th>商品名稱</th>
              <th>價格</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ width: "200px" }}>
                  <div
                    style={{
                      height: "100px",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundImage: `url(${p.imageUrl})`,
                    }}
                  ></div>
                </td>
                <td>{p.title}</td>
                <td>
                  <del className="h6">原價：${p.origin_price}</del>
                  <div className="h5">特價：${p.price}</div>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setProduct(p);
                        setModalQty(1);
                        productModalRef.current?.show();
                      }}
                      disabled={loadingProductId === p.id}
                    >
                      {loadingProductId === p.id ? (
                        <RotatingLines
                          visible={true}
                          height={16}
                          width={80}
                          color="grey"
                        />
                      ) : (
                        "查看更多"
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => addCart(p.id)}
                      disabled={loadingCartId === p.id}
                    >
                      {loadingCartId === p.id ? (
                        <RotatingLines
                          visible={true}
                          height={16}
                          width={80}
                          color="grey"
                        />
                      ) : (
                        "加入購物車"
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 購物車列表 */}
        <h2 className="mt-5" ref={checkoutRef}>
          結帳
        </h2>
        <div className="text-end mt-4">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={clearCart}
          >
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
                      value={cartItem.qty}
                      min={1}
                      onChange={(e) =>
                        updateCart(
                          cartItem.id,
                          cartItem.product.id,
                          Number(e.target.value)
                        )
                      }
                    />
                    <span
                      className="input-group-text"
                      id="inputGroup-sizing-sm"
                    >
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
                總計${cart?.final_total ?? 0}
              </td>
              <td className="text-end"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 訂購人表單 */}
       <div className="my-5 row justify-content-center">
        <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-control ${
                errors.email ? "is-invalid" : ""
              }`}
              placeholder="請輸入 Email"
              {...register("email", {
                required: "請輸入 Email",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "請輸入正確的 Email 格式",
                },
              })}
            />
            {errors.email && (
              <div className="invalid-feedback">
                {errors.email.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input
              id="name"
              type="text"
              className={`form-control ${
                errors.name ? "is-invalid" : ""
              }`}
              placeholder="請輸入姓名"
              {...register("name", {
                required: "請輸入姓名",
                minLength: {
                  value: 2,
                  message: "姓名至少需要 2 個字元",
                },
              })}
            />
            {errors.name && (
              <div className="invalid-feedback">
                {errors.name.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input
              id="tel"
              type="tel"
              className={`form-control ${
                errors.tel ? "is-invalid" : ""
              }`}
              placeholder="請輸入電話"
              {...register("tel", {
                required: "請輸入電話",
                pattern: {
                  value: /^\d+$/,
                  message: "電話格式錯誤，請輸入數字",
                },
                minLength: {
                  value: 8,
                  message: "電話至少需要 8 位數",
                },
              })}
            />
            {errors.tel && (
              <div className="invalid-feedback">
                {errors.tel.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input
              id="address"
              type="text"
              className={`form-control ${
                errors.address ? "is-invalid" : ""
              }`}
              placeholder="請輸入地址"
              {...register("address", {
                required: "請輸入地址",
              })}
            />
            {errors.address && (
              <div className="invalid-feedback">
                {errors.address.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              留言
            </label>
            <textarea
              id="message"
              className="form-control"
              cols="30"
              rows="5"
              {...register("message")}
            />
          </div>

          <div className="text-end">
            <button type="submit" className="btn btn-danger">
              送出訂單
            </button>
          </div>
        </form>
        <singleProductModal product={product} />
      </div>
    
    </>
  );
}

export default Checkout;
//