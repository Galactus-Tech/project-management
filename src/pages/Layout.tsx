import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { loadTheme } from '../features/themeSlice';
import { Loader2Icon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/store';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { loading } = useAppSelector((state) => state.workspace);
    const dispatch = useAppDispatch();

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme());
    }, [dispatch]);

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <main
                    id="main-content"
                    className="flex-1 h-full p-4 sm:p-6 lg:p-8 xl:px-12 overflow-y-auto"
                    role="main"
                    aria-label="Main content"
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
