import { useState } from 'react';
import axios from "axios";
import "../../assets/style.css";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);
  
  const handleInputChange = (e) => {
     
  const { name, value } = e.target;
  setFormData((prevData) => ({
    ...prevData, // 保留原有屬性
    [name]: value, // 更新特定屬性
  }));
  }
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

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE}/admin/signin`, formData);
      const { token,expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common['Authorization'] = token;
      await getProducts();
      setIsAuth(true);
    } catch (error) {
      console.error("登入失敗:", error);
      setIsAuth(false);
    }
  }
  
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

        axios.defaults.headers.common['Authorization'] = token;
      await axios.post(
        `${API_BASE}/api/user/check` );
        setIsAuth(true);
          } catch (error) {
     
      console.error("登入失敗:", error);
       setIsAuth(false);
    }
  }


  return (
    <>
    {
      !isAuth ? (
        <div className='container login'>
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" name="username" placeholder="name@example.com" value={formData.username} onChange={handleInputChange}
              required
              autoFocus/>
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange}
              required/>
              <label htmlFor="password">Password</label>
            </div>
            <button type='submit' className='btn btn-info w-100 mt-2 p-3' onClick={checkLogin} >登入</button>
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
                    <img src={tempProduct.imageUrl} className="card-img-top primary-image" alt="主圖" />
                    <div className="card-body">
                      <h3 className="card-title">{tempProduct.title}</h3>
                      <p className="card-text">
                        <span className="fw-bold">商品描述: </span>{tempProduct.description}
                      </p>
                      <p className="card-text">
                        <span className="fw-bold">商品內容: </span>{tempProduct.content}
                      </p>
                      <div className="d-flex"><p className="card-text"><span className="fw-bold">售價: </span><del className="text-secondary">{tempProduct.origin_price}元</del>/ {tempProduct.price}元</p></div>
                      <div className="d-flex">
                        {
                          tempProduct.imagesUrl.map((imgUrl, index) => {
                            return <img key={index} className="images" src={imgUrl} alt="附圖" />
                          })
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>請選擇一項商品查看</p>
                )}
              </div>
            </div>
          </div>
        )
      }
   
    </>
  
       
       
  );
}

export default Login
