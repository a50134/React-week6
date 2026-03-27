// src/views/back/AdminProducts.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import ProductModal from "../../components/ProductModal";
import Toasts from "../../components/Toasts";
import { useDispatch, useSelector } from "react-redux";
import { createMessage, removeMessage } from "../../slice/messageSlice";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function AdminProducts() {
  const [products, setProducts] = useState([]);

  // Modal 狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("create"); // create / edit / delete
  const [templateProduct, setTemplateProduct] = useState({
    title: "",
    category: "",
    origin_price: 0,
    price: 0,
    is_enabled: 0,
    unit: "件",
    imageUrl: "",
    imagesUrl: [],
    description: "",
    content: "",
  });

  // Redux
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.message);

  const showToast = (success, message) => {
    const id = Date.now();

    dispatch(
      createMessage({
        id,
        success,
        message,
      }),
    );

    // 3 秒後自動關閉這則訊息
    setTimeout(() => {
      dispatch(removeMessage(id));
    }, 3000);
  };

  // 取得產品列表
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      const productsData = Array.isArray(res.data.products)
        ? res.data.products
        : Object.values(res.data.products || {});
      setProducts(productsData);
      console.log("後台產品資料：", productsData);
    } catch (error) {
      console.error("取得後台產品失敗：", error?.response || error);
      showToast(false, "取得產品失敗，請確認是否登入或 API 設定是否正確");
    }
  };

  // 檢查登入
  const checkLogin = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];

      if (!token) {
        showToast(false, "尚未登入或 token 不存在，請先回登入頁重新登入");
        return;
      }

      axios.defaults.headers.common["Authorization"] = token;
      await axios.post(`${API_BASE}/api/user/check`);
      await getProducts();
    } catch (error) {
      console.error("登入狀態檢查失敗:", error?.response || error);
      showToast(false, "登入驗證失敗（401），請回登入頁重新登入");
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  // 開「新增產品」的 Modal
  const handleOpenCreateModal = () => {
    setModalType("create");
    setTemplateProduct({
      title: "",
      category: "",
      origin_price: 0,
      price: 0,
      is_enabled: 0,
      unit: "件",
      imageUrl: "",
      imagesUrl: [],
      description: "",
      content: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Modal 裡 input / textarea 共用的 onChange
  const handleModalInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setTemplateProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModalImageChange = (index, url) => {
    setTemplateProduct((prev) => {
      const images = Array.isArray(prev.imagesUrl) ? [...prev.imagesUrl] : [];
      images[index] = url;
      return {
        ...prev,
        imagesUrl: images,
      };
    });
  };

  const handleAddImage = () => {
    setTemplateProduct((prev) => ({
      ...prev,
      imagesUrl: [...(prev.imagesUrl || []), ""],
    }));
  };

  const handleRemoveImage = () => {
    setTemplateProduct((prev) => {
      const images = Array.isArray(prev.imagesUrl) ? [...prev.imagesUrl] : [];
      images.pop();
      return {
        ...prev,
        imagesUrl: images,
      };
    });
  };

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("選擇的檔案：", file);
    // 之後再串上傳圖片 API
  };

  const updateProduct = async () => {
    try {
      const payload = {
        data: {
          ...templateProduct,
          origin_price: Number(templateProduct.origin_price) || 0,
          price: Number(templateProduct.price) || 0,
          is_enabled: templateProduct.is_enabled ? 1 : 0,
        },
      };

      if (modalType === "edit" && templateProduct.id) {
        await axios.put(
          `${API_BASE}/api/${API_PATH}/admin/product/${templateProduct.id}`,
          payload,
        );
        showToast(true, "更新產品成功");
      } else {
        await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, payload);
        showToast(true, "新增產品成功");
      }

      closeModal();
      await getProducts();
    } catch (error) {
      console.error("儲存產品失敗：", error?.response || error);
      showToast(false, "儲存產品失敗，請確認欄位與 API 設定");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      showToast(true, "刪除產品成功");
      closeModal();
      await getProducts();
    } catch (error) {
      console.error("刪除產品失敗：", error?.response || error);
      showToast(false, "刪除產品失敗");
    }
  };

  return (
    <>
      <div className="container">
        <h1 className="my-3">產品列表</h1>

        <button
          className="btn btn-primary mb-3"
          type="button"
          onClick={handleOpenCreateModal}
        >
          建立新的產品
        </button>

        <table className="table">
          <thead>
            <tr>
              <th>分類</th>
              <th>產品名稱</th>
              <th>原價</th>
              <th>售價</th>
              <th>是否啟用</th>
              <th>編輯</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td>{item.category}</td>
                <td>{item.title}</td>
                <td>{item.origin_price}</td>
                <td>{item.price}</td>
                <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => {
                      setModalType("edit");
                      setTemplateProduct({
                        ...item,
                        imagesUrl: item.imagesUrl || [],
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setModalType("delete");
                      setTemplateProduct(item);
                      setIsModalOpen(true);
                    }}
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  尚無產品資料
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <ProductModal
          isOpen={isModalOpen}
          modalType={modalType}
          templateProduct={templateProduct}
          handleModalInputChange={handleModalInputChange}
          handleModalImageChange={handleModalImageChange}
          handleAddImage={handleAddImage}
          handleRemoveImage={handleRemoveImage}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
          uploadImage={uploadImage}
          closeModal={closeModal}
        />
      </div>

      <Toasts
        messages={messages}
        removeMessage={(id) => dispatch(removeMessage(id))}
      />
    </>
  );
}

export default AdminProducts;
