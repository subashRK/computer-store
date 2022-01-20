import { addDoc, collection, onSnapshot, updateDoc } from "@firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "@firebase/storage";
import { createContext, useContext, useEffect, useState } from "react";
import { firestore, storage } from "../firebase";
import { useAuth } from "./AuthContext";

const ProductsContext = createContext();

const useProducts = () => useContext(ProductsContext);

const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(null);
  const [userOwnedProducts, setUserOwnedProducts] = useState(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "products"),
      (snapshot) => {
        const products = snapshot.docs.map((product) => ({
          id: product.id,
          ...product.data(),
        }));

        setProducts(products);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!products) return;

    const newUserOwnedProducts = products.filter(
      (product) =>
        product.reservedBy?.find(
          (reserved) => reserved.email === currentUser.email
        ) !== (null || undefined)
    );

    setUserOwnedProducts(newUserOwnedProducts);
  }, [products, currentUser]);

  const addProduct = async (
    { file, name, price, quantity },
    uploadCallbacks
  ) => {
    try {
      const doc = await addDoc(collection(firestore, "products"), {
        name,
        price,
        quantity,
      });

      const imageRef = ref(storage, `products/${doc.id}`);
      const uploadTask = uploadBytesResumable(imageRef, file);

      uploadTask.on(
        "state_changed",
        uploadCallbacks.progress,
        uploadCallbacks.error,
        async () => {
          const imageURL = await getDownloadURL(uploadTask.snapshot.ref);

          await updateDoc(doc, {
            image: imageURL,
          });

          uploadCallbacks.complete();
        }
      );
    } catch {
      uploadCallbacks.error({ message: "Something went wrong!" });
    }
  };

  const value = {
    products,
    userOwnedProducts,
    addProduct,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export { useProducts, ProductsProvider };
