import "./Sidebar.css";

import paths from "../constants/paths.js";
import { useState } from "react";

import { Link } from "react-router";
import {
    CDBSidebar,
    CDBSidebarContent,
    CDBSidebarHeader,
    CDBSidebarMenu,
    CDBSidebarMenuItem,
    CDBSidebarFooter,
} from "cdbreact";

function Sidebar() {
    const brand = "Gestión de Consorcios";
    const menu = [
        { name: "Reportes", path: paths.reports, icon: "chart-bar" },
        { name: "Gastos particulares", path: paths.individualExpenses, icon: "wallet" },
        { name: "Gastos comunes", path: paths.commonExpenses, icon: "building" },
        { name: "Moras", path: paths.overdues, icon: "exclamation-circle" },
        { name: "Comisiones", path: paths.fees, icon: "hand-holding-usd" },
    ];

    const [activeItem, setActiveItem] = useState(paths.reports);

    return (
        <CDBSidebar textColor="var(--light-text)" backgroundColor="var(--dark-bg)" className="sidebar">
            <CDBSidebarHeader prefix={<i className="fa fa-bars" />}>
                <div className="mx-2">{brand}</div>
            </CDBSidebarHeader>

            <CDBSidebarContent>
                <CDBSidebarMenu>
                    {menu.map((item) => (
                        <Link to={item.path} key={item.name}>
                            <CDBSidebarMenuItem
                                icon={item.icon}
                                active={activeItem === item.path}
                                onClick={() => setActiveItem(item.path)}
                            >
                                {item.name}
                            </CDBSidebarMenuItem>
                        </Link>
                    ))}
                </CDBSidebarMenu>
            </CDBSidebarContent>

            <CDBSidebarFooter className="p-3 text-center">
                <p className="mb-0">GDPI - G6</p>
                <p className="mb-0">@2025</p>
            </CDBSidebarFooter>
        </CDBSidebar>
    );
}

export default Sidebar;
