import React from "react";
import axios from "axios";
import { Route } from "react-router-dom";
import AppContext from "./context";
import Header from "./components/Header";
import Drawer from "./components/Drawer/Drawer";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";

import { ITEMS_API, CART_API, FAVORITES_API } from "./config";

function App() {
  const [items, setItems] = React.useState([]);
  const [cartItems, setCartItems] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [cartOpened, setCartOpened] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      async function fetchData() {
        const [cartResponse, favoritesResponse, itemResponse] =
          await Promise.all([
            axios.get(CART_API),
            axios.get(FAVORITES_API),
            axios.get(ITEMS_API),
          ]);

        setIsLoading(false);

        setCartItems(cartResponse.data);
        setFavorites(favoritesResponse.data);
        setItems(itemResponse.data);
      }
      fetchData();
    } catch (err) {
      console.log("Ошибка при загрузке данных");
      console.log(err);
    }
  }, []);

  const onAddToCart = async (obj) => {
    try {
      const findItem = cartItems.find((item) => +item.parentId === +obj.id);
      if (findItem) {
        setCartItems((prev) =>
          prev.filter((item) => +item.parentId !== +obj.id)
        );
        await axios.delete(`${CART_API}/${findItem.id}`);
      } else {
        setCartItems((prev) => [...prev, obj]);
        const { data } = await axios.post(CART_API, obj);
        setCartItems((prev) =>
          prev.map((item) => {
            if (item.parentId === data.parentId) {
              return {
                ...item,
                id: data.id,
              };
            }
            return item;
          })
        );
      }
    } catch (error) {
      console.log("Не удалось добавить в корзину :(");
    }
  };

  const onRemoveItem = (id) => {
    try {
      setCartItems((prev) => prev.filter((item) => +item.id !== +id));
      axios.delete(`${CART_API}/${id}`);
    } catch (err) {
      console.log("Не удалось удалить из корзины :(");
    }
  };

  const onAddToFavorite = async (obj) => {
    try {
      if (favorites.find((favObj) => +favObj.id === +obj.id)) {
        axios.delete(`${FAVORITES_API}/${obj.id}`);
        setFavorites((prev) => prev.filter((item) => +item.id !== +obj.id));
      } else {
        const { data } = await axios.post(FAVORITES_API, obj);
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
    return cartItems.some((obj) => +obj.parentId === +id);
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

        <Drawer
          items={cartItems}
          onClose={() => setCartOpened(false)}
          onRemove={onRemoveItem}
          opened={cartOpened}
        />

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

        <Route path="/orders" exact>
          <Orders />
        </Route>
      </div>
    </AppContext.Provider>
  );
}
export default App;
