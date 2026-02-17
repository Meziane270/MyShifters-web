// src/pages/admin/users/AdminUsers.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    RefreshCw,
    Search,
    Download,
    Filter
} from "lucide-react";
import UserFilters from "./components/UserFilters";
import UserTable from "./components/UserTable";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminUsers() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
    });
    const [filters, setFilters] = useState({
        role: "",
        verification: "",
        search: ""
    });
    const [showFilters, setShowFilters] = useState(false);

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pagination.limit,
                ...filters
            };
            if (!params.role) delete params.role;
            if (!params.verification) delete params.verification;
            if (!params.search) delete params.search;

            const res = await axios.get(`${API}/admin/users`, {
                headers: getAuthHeader(),
                params
            });
            setUsers(res.data.users || []);
            setPagination({
                total: res.data.total,
                page: res.data.page,
                limit: res.data.limit,
                pages: res.data.pages
            });
        } catch (e) {
            toast.error("Impossible de charger les utilisateurs");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader, pagination.limit, filters]); // ← DÉPENDANCES
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1);
    };

    const handleExport = async () => {
        try {
            const res = await axios.get(`${API}/admin/users/export`, {
                headers: getAuthHeader(),
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'utilisateurs.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            toast.error("Erreur lors de l'export");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Utilisateurs
                    </h1>
                    <p className="text-foreground/70">
                        {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} au total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="border-border"
                        onClick={handleExport}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        className="border-border"
                        onClick={() => fetchUsers(pagination.page)}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                    <Input
                        type="text"
                        placeholder="Rechercher par email, nom, hôtel..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-9 bg-background border-border"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className={`border-border ${showFilters ? 'bg-brand/10 text-brand' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                </Button>
                <Button type="submit" className="bg-brand hover:bg-brand-light text-primary-foreground">
                    Rechercher
                </Button>
            </form>

            {/* Filters */}
            {showFilters && (
                <UserFilters
                    filters={filters}
                    onChange={setFilters}
                />
            )}

            {/* Users table */}
            <UserTable
                users={users}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchUsers}
            />
        </div>
    );
}