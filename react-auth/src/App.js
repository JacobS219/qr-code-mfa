import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/login.jsx';
import { Nav } from './components/nav.jsx';
import { Register } from './components/register.jsx';
import { User } from './components/user.jsx';
import { ForgotPassword } from './components/forgot-password.jsx';
import { ResetPassword } from './components/reset-password.jsx';

function App() {
    return <Router>
        <Nav />

        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user" element={<User />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
    </Router>;
}

export default App;
