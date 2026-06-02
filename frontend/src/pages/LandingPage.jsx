import React from "react";
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { motion } from "framer-motion";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "../styles/App.css";

export default function App() {
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Deliveries",
        data: [65, 78, 52, 91, 83, 106],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const orderStatusSeverity = {
    pending: "warning",
    assigned: "info",
    picked_up: "primary",
    in_transit: "primary",
    delivered: "success",
    cancelled: "danger",
  };

  const orders = [
    {
      id: "ORD-7892",
      from: "New York, NY",
      to: "Austin, TX",
      status: "in_transit",
      eta: "2h 15m",
    },
    {
      id: "ORD-7893",
      from: "Miami, FL",
      to: "Atlanta, GA",
      status: "delivered",
      eta: "Delivered",
    },
    {
      id: "ORD-7894",
      from: "Seattle, WA",
      to: "Portland, OR",
      status: "pending",
      eta: "Pending",
    },
    {
      id: "ORD-7895",
      from: "Denver, CO",
      to: "Phoenix, AZ",
      status: "assigned",
      eta: "4h 30m",
    },
  ];

  const statusLabel = (status) =>
    status?.replace("_", " ").toUpperCase();

  return (
    <div className="app">
      {/* Navbar */}
      <div className="navbar flex justify-content-between align-items-center px-6 py-4">
        <div className="logo flex align-items-center gap-2">
          <div
            className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--purple))",
              boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)",
            }}
          >
            <i className="pi pi-box text-white"></i>
          </div>
          <h2 className="m-0 font-bold text-white">LogiTrack</h2>
        </div>

        <div className="nav-links flex gap-4">
          <a href="#">
            <span className="text-white font-medium">Home</span>
          </a>
          <a href="#" className="text-secondary hover:text-white transition-all">
            Features
          </a>
          <a href="#" className="text-secondary hover:text-white transition-all">
            Solutions
          </a>
          <a href="#" className="text-secondary hover:text-white transition-all">
            Pricing
          </a>
          <a href="#" className="text-secondary hover:text-white transition-all">
            About Us
          </a>
          <a href="#" className="text-secondary hover:text-white transition-all">
            Contact
          </a>
        </div>

        <div className="flex gap-3">
          <Button
            label="Log In"
            className="p-button-text nav-btn text-white"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "50px",
              padding: "0.5rem 1.5rem",
            }}
          />

          <Button
            label="Get Started"
            className="hero-btn"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--purple))",
              border: "none",
              borderRadius: "50px",
              padding: "0.5rem 1.5rem",
              boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)",
            }}
          />
        </div>
      </div>

      {/* Hero */}
      <div className="grid hero-section px-6 pt-8">
        <div className="col-12 md:col-6 flex flex-column justify-content-center">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span>🚛</span>
            <span className="font-medium text-sm">
              Smart Logistics, Delivered
            </span>
          </motion.div>

          <motion.h1
            className="hero-title mt-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Fast, Reliable
            <br />
            <span className="gradient-text">Delivery Logistics</span>
          </motion.h1>

          <motion.p
            className="hero-text mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Real-time tracking, intelligent routing, and instant
            notifications for your delivery operations. Track packages with
            precision using our advanced logistics platform.
          </motion.p>

          <motion.div
            className="flex gap-3 mt-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              label="Get Started Free"
              icon="pi pi-send"
              className="hero-btn"
            />
            <Button
              label="Log In"
              icon="pi pi-sign-in"
              className="outline-btn"
              style={{
                background: "rgba(4,13,33,0.5)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "white",
                borderRadius: "50px",
                padding: "0.875rem 1.5rem",
              }}
            />
          </motion.div>

          <motion.div
            className="search-box mt-6 flex"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <InputText
              placeholder="Enter Order ID to track..."
              className="track-input"
            />
            <Button
              icon="pi pi-arrow-right"
              className="track-btn"
              style={{
                marginLeft: "0.5rem",
                background: "linear-gradient(135deg, var(--blue), var(--purple))",
                border: "none",
                borderRadius: "14px",
              }}
            />
          </motion.div>

          <motion.div
            className="flex align-items-center gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AvatarGroup>
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                size="large"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png"
                size="large"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png"
                size="large"
                shape="circle"
              />
              <Avatar
                label="+5"
                size="large"
                shape="circle"
                style={{ background: "var(--blue)" }}
              />
            </AvatarGroup>
            <div className="flex flex-column">
              <span className="text-white font-bold">2,500+</span>
              <span className="text-secondary text-sm">Active Users</span>
            </div>
          </motion.div>
        </div>

        <div className="col-12 md:col-6 flex justify-content-center align-items-center">
          <motion.div
            className="dashboard-mockup"
            initial={{ opacity: 0, y: 40, rotateY: -8 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{
              perspective: "1200px",
            }}
          >
            <Card
              className="border-round-xl shadow-5"
              style={{
                background: "rgba(4,13,33,0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "24px",
                boxShadow: "0 40px 80px rgba(37, 99, 235, 0.15)",
                maxWidth: "480px",
                width: "100%",
              }}
            >
              <div className="p-4">
                <div className="flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="text-white m-0 text-lg font-bold">
                      Dashboard
                    </h3>
                    <p className="text-secondary m-0 text-sm mt-1">
                      Live overview
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        borderRadius: "50%",
                      }}
                    >
                      <i className="pi pi-search text-sm text-blue-400"></i>
                    </div>
                    <div
                      className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        borderRadius: "50%",
                      }}
                    >
                      <i className="pi pi-refresh text-sm text-blue-400"></i>
                    </div>
                  </div>
                </div>

                <div className="grid mb-4">
                  <div className="col-6 md:col-3">
                    <div
                      className="border-round p-3 mb-2"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(59,130,246,0.08)",
                      }}
                    >
                      <p className="text-secondary text-xs m-0">
                        Total Orders
                      </p>
                      <h4 className="text-white m-0 text-lg font-bold">
                        12,540
                      </h4>
                      <span className="text-green-400 text-xs">
                        +18.2%
                      </span>
                    </div>
                  </div>
                  <div className="col-6 md:col-3">
                    <div
                      className="border-round p-3 mb-2"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(59,130,246,0.08)",
                      }}
                    >
                      <p className="text-secondary text-xs m-0">
                        In Transit
                      </p>
                      <h4 className="text-white m-0 text-lg font-bold">
                        8,420
                      </h4>
                      <span className="text-green-400 text-xs">
                        +14.7%
                      </span>
                    </div>
                  </div>
                  <div className="col-6 md:col-3">
                    <div
                      className="border-round p-3 mb-2"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(59,130,246,0.08)",
                      }}
                    >
                      <p className="text-secondary text-xs m-0">
                        Delivered
                      </p>
                      <h4 className="text-white m-0 text-lg font-bold">
                        4,120
                      </h4>
                      <span className="text-green-400 text-xs">
                        +22.1%
                      </span>
                    </div>
                  </div>
                  <div className="col-6 md:col-3">
                    <div
                      className="border-round p-3 mb-2"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(59,130,246,0.08)",
                      }}
                    >
                      <p className="text-secondary text-xs m-0">
                        Cancelled
                      </p>
                      <h4 className="text-white m-0 text-lg font-bold">
                        230
                      </h4>
                      <span className="text-red-400 text-xs">-2.4%</span>
                    </div>
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-8">
                    <Card
                      className="border-round-xl"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(59,130,246,0.08)",
                        borderRadius: "16px",
                      }}
                    >
                      <h4 className="text-white m-0 mb-3 text-sm font-bold">
                        Delivery Analytics
                      </h4>
                      <Chart
                        type="line"
                        data={chartData}
                        options={{
                          plugins: { legend: { display: false } },
                          scales: {
                            x: {
                              ticks: { color: "#94a3b8" },
                              grid: { color: "rgba(255,255,255,0.05)" },
                            },
                            y: {
                              ticks: { color: "#94a3b8" },
                              grid: { color: "rgba(255,255,255,0.05)" },
                            },
                          },
                        }}
                        style={{ height: "200px" }}
                      />
                    </Card>
                  </div>
                  <div className="col-12 md:col-4">
                    <Card
                      className="border-round-xl"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(59,130,246,0.08)",
                        borderRadius: "16px",
                      }}
                    >
                      <h4 className="text-white m-0 mb-3 text-sm font-bold">
                        Live Tracking
                      </h4>
                      <div
                        className="flex flex-column gap-3"
                        style={{ height: "200px", position: "relative" }}
                      >
                        <div className="map-grid"></div>
                        <div className="map-route-line"></div>
                        <div
                          className="flex align-items-center gap-2 p-2 border-round"
                          style={{
                            background: "rgba(59,130,246,0.1)",
                            border: "1px solid rgba(59,130,246,0.2)",
                          }}
                        >
                          <div
                            className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
                            style={{
                              background: "var(--blue)",
                              borderRadius: "50%",
                            }}
                          >
                            <i className="pi pi-truck text-white text-xs"></i>
                          </div>
                          <div className="flex flex-column">
                            <span className="text-white text-sm font-bold">
                              Truck #LT42
                            </span>
                            <span className="text-secondary text-xs">
                              In Transit
                            </span>
                          </div>
                          <Tag
                            value="Live"
                            severity="success"
                            className="ml-auto"
                          />
                        </div>
                        <div
                          className="flex align-items-center gap-2 p-2 border-round"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.2)",
                          }}
                        >
                          <div
                            className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
                            style={{
                              background: "var(--green)",
                              borderRadius: "50%",
                            }}
                          >
                            <i className="pi pi-check text-white text-xs"></i>
                          </div>
                          <div className="flex flex-column">
                            <span className="text-white text-sm font-bold">
                              Truck #LT15
                            </span>
                            <span className="text-secondary text-xs">
                              Delivered
                            </span>
                          </div>
                          <Tag
                            value="Done"
                            severity="info"
                            className="ml-auto"
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-white m-0 mb-3 text-sm font-bold">
                    Recent Deliveries
                  </h4>
                  <DataTable
                    value={orders}
                    paginator
                    rows={3}
                    className="p-datatable-sm"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "12px",
                    }}
                  >
                    <Column field="id" header="Order ID"></Column>
                    <Column field="from" header="From"></Column>
                    <Column field="to" header="To"></Column>
                    <Column
                      field="status"
                      header="Status"
                      body={(rowData) => (
                        <Tag
                          value={statusLabel(rowData.status)}
                          severity={orderStatusSeverity[rowData.status]}
                        />
                      )}
                    ></Column>
                    <Column field="eta" header="ETA"></Column>
                  </DataTable>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section grid px-6 mt-5">
        <div className="col-12 md:col-3">
          <Card
            className="stats-card border-round-xl text-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "2rem",
            }}
          >
            <div
              className="w-3rem h-3rem border-round-xl flex align-items-center justify-content-center mx-auto mb-3"
              style={{ background: "rgba(37,99,235,0.15)", borderRadius: "16px" }}
            >
              <span className="text-2xl">👥</span>
            </div>
            <h2 className="text-blue-400 m-0 text-2xl font-bold">250M+</h2>
            <p className="text-secondary m-0 text-sm mt-1">Active Users</p>
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card
            className="stats-card border-round-xl text-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "2rem",
            }}
          >
            <div
              className="w-3rem h-3rem border-round-xl flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                background: "rgba(20,184,166,0.15)",
                borderRadius: "16px",
              }}
            >
              <span className="text-2xl">🛡️</span>
            </div>
            <h2 className="text-teal-400 m-0 text-2xl font-bold">99.9%</h2>
            <p className="text-secondary m-0 text-sm mt-1">On-Time Delivery</p>
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card
            className="stats-card border-round-xl text-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "2rem",
            }}
          >
            <div
              className="w-3rem h-3rem border-round-xl flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                background: "rgba(245,158,11,0.15)",
                borderRadius: "16px",
              }}
            >
              <span className="text-2xl">🏙️</span>
            </div>
            <h2 className="text-yellow-400 m-0 text-2xl font-bold">150+</h2>
            <p className="text-secondary m-0 text-sm mt-1">Cities Covered</p>
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card
            className="stats-card border-round-xl text-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "2rem",
            }}
          >
            <div
              className="w-3rem h-3rem border-round-xl flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                background: "rgba(124,58,237,0.15)",
                borderRadius: "16px",
              }}
            >
              <span className="text-2xl">🎧</span>
            </div>
            <h2 className="text-purple-400 m-0 text-2xl font-bold">24/7</h2>
            <p className="text-secondary m-0 text-sm mt-1">Support</p>
          </Card>
        </div>
      </div>

      {/* Analytics Strip */}
      <div className="px-6 py-8">
        <div
          className="grid p-4 border-round-xl"
          style={{
            background: "rgba(4,13,33,0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: "24px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div className="col-12 md:col-3 text-center p-3">
            <h3 className="text-white m-0 text-xl font-bold">12,540</h3>
            <p className="text-secondary m-0 text-sm mt-1">Total Orders</p>
            <ProgressBar
              value={75}
              style={{
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "999px",
                marginTop: "0.5rem",
              }}
            />
            <span className="text-green-400 text-xs font-bold">+18.2%</span>
          </div>
          <div className="col-12 md:col-3 text-center p-3">
            <h3 className="text-white m-0 text-xl font-bold">8,420</h3>
            <p className="text-secondary m-0 text-sm mt-1">In Transit</p>
            <ProgressBar
              value={60}
              style={{
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "999px",
                marginTop: "0.5rem",
              }}
            />
            <span className="text-green-400 text-xs font-bold">+14.7%</span>
          </div>
          <div className="col-12 md:col-3 text-center p-3">
            <h3 className="text-white m-0 text-xl font-bold">4,120</h3>
            <p className="text-secondary m-0 text-sm mt-1">Delivered</p>
            <ProgressBar
              value={90}
              style={{
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "999px",
                marginTop: "0.5rem",
              }}
            />
            <span className="text-green-400 text-xs font-bold">+22.1%</span>
          </div>
          <div className="col-12 md:col-3 text-center p-3">
            <h3 className="text-white m-0 text-xl font-bold">230</h3>
            <p className="text-secondary m-0 text-sm mt-1">Cancelled</p>
            <ProgressBar
              value={15}
              style={{
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "999px",
                marginTop: "0.5rem",
              }}
            />
            <span className="text-red-400 text-xs font-bold">-2.4%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 py-8 mt-4"
        style={{
          borderTop: "1px solid rgba(59,130,246,0.1)",
        }}
      >
        <div className="flex justify-content-between align-items-center">
          <div className="logo flex align-items-center gap-2">
            <div
              className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
              style={{
                background: "linear-gradient(135deg, var(--blue), var(--purple))",
                borderRadius: "8px",
              }}
            >
              <i className="pi pi-box text-white"></i>
            </div>
            <h2 className="m-0 font-bold text-white">LogiTrack</h2>
          </div>
          <p className="text-secondary m-0 text-sm">
            © 2024 LogiTrack. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
