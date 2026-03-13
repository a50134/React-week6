import { useState } from "react";
import axios from "axios";
import "../../assets/style.css";
import { useForm } from "react-hook-form";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login() {
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  // react-hook-form 設定
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 取得產品列表
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      console.log("產品資料：", response.data);
      setProducts(response.data.products);
    } catch (error) {
      console.error("取得產品失敗：", error);
    }
  };

  // 送出登入表單
  const onSubmit = async (data) => {
    try {
      // data = { username: "...", password: "..." }
      const response = await axios.post(
        `${API_BASE}/admin/signin`,
        data
      );
      const { token, expired } = response.data;
      // 寫入 cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 設定 axios 預設 header
      axios.defaults.headers.common["Authorization"] = token;
      // 拿產品
      await getProducts();
      setIsAuth(true);
    } catch (error) {
      console.error("登入失敗:", error);
      setIsAuth(false);
    }
  };

  // 檢查登入狀態
  const checkLogin = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];

      if (!token) {
        console.error("沒有找到 token，請重新登入");
        setIsAuth(false);
        return;
      }

      axios.defaults.headers.common["Authorization"] = token;
      await axios.post(`${API_BASE}/api/user/check`);
      setIsAuth(true);
    } catch (error) {
      console.error("登入狀態檢查失敗:", error);
      setIsAuth(false);
    }
  };

  const handleDeleteProduct = async (id) => {
  const confirmDelete = window.confirm("確定要刪除這個產品嗎？");
  if (!confirmDelete) return;

  try {
    await axios.delete(
      `${API_BASE}/api/${API_PATH}/admin/product/${id}`
    );
    // 刪掉後重新抓產品列表，或直接從 state 移除
    await getProducts();
  } catch (error) {
    console.error("刪除產品失敗：", error);
  }
};


  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                {...register("username", {
                  required: "請輸入 Email",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email 格式不正確",
                  },
                })}
                autoFocus
              />
              <label htmlFor="username">Email address</label>
              {errors.username && (
                <p className="text-danger">{errors.username.message}</p>
              )}
            </div>

            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                {...register("password", {
                  required: "請輸入密碼",
                  minLength: {
                    value: 6,
                    message: "密碼長度至少需 6 碼",
                  },
                })}
              />
              <label htmlFor="password">Password</label>
              {errors.password && (
                <p className="text-danger">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-info w-100 mt-2 p-3"
            >
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="row mt-2">
            <div className="col-md-6">
              <button
                className="btn btn-danger mb-5"
                type="button"
                onClick={checkLogin}
              >
                確認是否登入
              </button>
              <h1>產品列表</h1>
              <table className="table">
                <thead>
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col">查看詳情</th>
                  <th scope="col">刪除</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  return (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>{product.is_enabled ? "啟用" : "不啟用"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setTempProduct(product)}
                        >
                          查看細節
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              </table>
            </div>

            <div className="col-md-6">
              <h1>單一產品詳情</h1>
              {tempProduct ? (
                <div className="card">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h3 className="card-title">{tempProduct.title}</h3>
                    <p className="card-text">
                      <span className="fw-bold">商品描述: </span>
                      {tempProduct.description}
                    </p>
                    <p className="card-text">
                      <span className="fw-bold">商品內容: </span>
                      {tempProduct.content}
                    </p>
                    <div className="d-flex">
                      <p className="card-text">
                        <span className="fw-bold">售價: </span>
                        <del className="text-secondary">
                          {tempProduct.origin_price}元
                        </del>
                        / {tempProduct.price}元
                      </p>
                    </div>
                    <div className="d-flex">
                      {Array.isArray(tempProduct.imagesUrl) &&
                        tempProduct.imagesUrl.map((imgUrl, index) => {
                          return (
                            <img
                              key={index}
                              className="images"
                              src={imgUrl}
                              alt="附圖"
                            />
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                <p>請選擇一項商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
