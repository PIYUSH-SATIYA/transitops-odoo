import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import Layout from "./pages/Layout";
import Home from "./pages/Home";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
    <Route path="/" element={<Layout />}>
    </Route>
    </>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;