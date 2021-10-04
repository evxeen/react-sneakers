import React from "react";
import axios from "axios";
import { Route } from "react-router-dom";
import AppContext from "./context";
import Header from "./components/Header";
import Drawer from "./components/Drawer";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";

function App() {
  const [items, setItems] = React.useState([]);
  const [cartItems, setCartItems] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [cartOpened, setCartOpened] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const cartResponse = await axios.get(
        "https://6158bb2d5167ba00174bbbcf.mockapi.io/cart"
      );
      const favoritesResponse = await axios.get(
        "https://6158bb2d5167ba00174bbbcf.mockapi.io/favorites"
      );
      const itemResponse = await axios.get(
        "https://6158bb2d5167ba00174bbbcf.mockapi.io/items"
      );
      setIsLoading(false);

      setCartItems(cartResponse.data);
      setFavorites(favoritesResponse.data);
      setItems(itemResponse.data);
    }
    fetchData();
  }, []);

  const onAddToCart = (obj) => {
    try {
      if (cartItems.find((item) => +item.id === +obj.id)) {
        axios.delete(
          `https://6158bb2d5167ba00174bbbcf.mockapi.io/cart/${obj.id}`
        );
        setCartItems((prev) => prev.filter((item) => +item.id !== +obj.id));
      } else {
        axios.post("https://6158bb2d5167ba00174bbbcf.mockapi.io/cart", obj);
        setCartItems((prev) => [...prev, obj]);
      }
    } catch (error) {
      console.log("Не удалось добавить в корзину :(");
    }
  };

  const onRemoveItem = (id) => {
    axios.delete(`https://6158bb2d5167ba00174bbbcf.mockapi.io/cart/${id}`);
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const onAddToFavorite = async (obj) => {
    try {
      if (favorites.find((favObj) => +favObj.id === +obj.id)) {
        axios.delete(
          `https://6158bb2d5167ba00174bbbcf.mockapi.io/favorites/${obj.id}`
        );
        setFavorites((prev) => prev.filter((item) => +item.id !== +obj.id));
      } else {
        const { data } = await axios.post(
          "https://6158bb2d5167ba00174bbbcf.mockapi.io/favorites",
          obj
        );
        setFavorites((prev) => [...prev, data]);
      }
    } catch (error) {
      alert("Не удалось добавить в фавориты");
    }
  };

  const onChangeSearchInput = (event) => {
    setSearchValue(event.target.value);
  };

  const isItemAdded = (id) => {
    return cartItems.some((obj) => +obj.id === +id);
  };

  return (
    <AppContext.Provider
      value={{
        items,
        cartItems,
        favorites,
        isItemAdded,
        onAddToFavorite,
        setCartOpened,
        setCartItems,
      }}
    >
      <div className="wrapper clear">
        {cartOpened && (
          <Drawer items={cartItems} onClose={() => setCartOpened(false)} />
        )}
        {cartOpened && (
          <Drawer
            items={cartItems}
            onClose={() => setCartOpened(false)}
            onRemove={onRemoveItem}
          />
        )}

        <Header onClickCart={() => setCartOpened(true)} />
        <Route path="/" exact>
          <Home
            items={items}
            cartItems={cartItems}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onChangeSearchInput={onChangeSearchInput}
            onAddToFavorite={onAddToFavorite}
            onAddToCart={onAddToCart}
            isLoading={isLoading}
          />
        </Route>

        <Route path="/favorites" exact>
          <Favorites onAddToFavorite={onAddToFavorite} />
        </Route>
      </div>
    </AppContext.Provider>
  );
}
export default App;
