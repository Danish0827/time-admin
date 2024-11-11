"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { PowerIcon } from "@heroicons/react/24/solid";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  CircleUserRound,
  FolderKanban,
  GalleryVerticalEnd,
  Plus,
  Power,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Space } from "antd";
import Cookies from "js-cookie";
import UserContext from "@/context/context";
import { BACKEND_URL } from "@/app/page";
import jwt from "jsonwebtoken";

export const getCookieToken = () => {
  const authToken = Cookies.get("authToken");
  return authToken;
};

const Sidebar = () => {
  const token = getCookieToken();
  const router = useRouter();
  const [session, setSession] = useState("");
  const [open, setOpen] = useState(0);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  // useEffect(() => {
  //   const authToken = Cookies.get("authToken");
  //   const parseToken = authToken ? JSON.parse(authToken) : null;
  //   if (!parseToken?.id) {
  //     router.push("/");
  //     return;
  //   }
  // }, []);

  // table part
  const [render, setRender] = useState(false);
  const [users, setUsers] = useState([]);
  const { setUser } = useContext(UserContext);
  // console.log(users);
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decodedToken = jwt.decode(token);
          const expirationTime = decodedToken.exp - 10;
          const currentTimeInSeconds = Math.floor(Date.now() / 1000);
          if (expirationTime > currentTimeInSeconds) {
            // Token is still valid
          } else {
            console.log("Token has expired.");
            document.cookie =
              "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            Swal.fire({
              title: "Session Expired!",
              text: "Session has been expired please login again!",
              icon: "error",
              confirmButtonText: "Login",
            }).then(() => {
              window.location.href = "/";
            });
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };
    // Initial check
    checkTokenExpiration();
    // Set interval to check every 10 seconds
    const intervalId = setInterval(checkTokenExpiration, 10000);
    // Cleanup function to clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getUsers`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookieToken()}`,
          },
        });

        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData.users);
          setUser(usersData.rowCount);
        } else {
          console.error("Error fetching users data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, [render]);

  const [masjid, setMasjid] = useState([]);
  const { setMasjids } = useContext(UserContext);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getMasjid`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookieToken()}`,
          },
        });

        if (response.ok) {
          const masjidData = await response.json();
          setMasjid(masjidData.masjid);
          setMasjids(masjidData.rowCount);
        } else {
          console.error("Error fetching users data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, [render]);

  const [feature, setFeature] = useState([]);
  const { setFeatures } = useContext(UserContext);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getFeature`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookieToken()}`,
          },
        });

        if (response.ok) {
          const featureData = await response.json();
          setFeature(featureData.features);
          setFeatures(featureData.rowCount);
        } else {
          console.error("Error fetching feature data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, [render]);

  const [subscription, setSubscription] = useState([]);
  const { setSplan } = useContext(UserContext);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${BACKEND_URL}/api/getSubscription`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookieToken()}`,
        },
      });
      try {
        if (response.ok) {
          const SubscriptionData = await response.json();
          // console.log(SubscriptionData,"asasas");
          setSubscription(SubscriptionData.plan);
          setSplan(SubscriptionData.rowCount);
        } else {
          console.error("Error fetching Subscription data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, [render]);

  const [hadeeth, setHadeeth] = useState([]);
  const { setHadeeths } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getHadeeth`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookieToken()}`,
          },
        });

        if (response.ok) {
          const hadeethData = await response.json();
          setHadeeth(hadeethData.hadeeth);
          setHadeeths(hadeethData.rowCount);
        } else {
          console.error("Error Fetching Hadeeth Data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    fetchData();
  }, [render]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, log out!",
    }).then((result) => {
      if (result.isConfirmed) {
        Cookies.remove("authToken");
        router.push("/");
      }
    });
  };

  // bg-[#2b2b2b]
  return (
    <Card
      style={{
        minHeight: "100vh",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      }}
      className="h-[100vh] sticky top-0 min-w-[20%] p-4 rounded-none shadow-xl bg-white text-black"
    >
      <div style={{ width: "280px" }} className=" mb-5 ">
        <Link href={"/"}>
          <img
            src="./masjid-logo.png"
            className="h-full w-full object-contain"
            alt=""
          />
        </Link>
      </div>
      <List className="">
        <Link href={"/"}>
          <ListItem className="text-black">
            <ListItemPrefix>
              <CircleUserRound size={20} />
            </ListItemPrefix>
            Dasdboard
          </ListItem>
        </Link>
        <Link href={"/trustee"}>
          <ListItem className="text-black">
            <ListItemPrefix>
              <CircleUserRound size={20} />
            </ListItemPrefix>
            Trustees
          </ListItem>
        </Link>
        <Link href={"/masjid"}>
          <ListItem className="text-black">
            <ListItemPrefix>
              <CircleUserRound size={20} />
            </ListItemPrefix>
            Masjid
          </ListItem>
        </Link>
        <Accordion
          open={open === 1}
          icon={
            <ChevronDownIcon
              color="white"
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${
                open === 1 ? "rotate-180" : ""
              }`}
            />
          }
        >
          <ListItem className="p-0" selected={open === 1}>
            <AccordionHeader
              onClick={() => handleOpen(1)}
              className="border-b-0 p-3 text-black"
            >
              <ListItemPrefix className="text-black">
                <FolderKanban size={20} />
              </ListItemPrefix>
              <Typography className="mr-auto font-normal text-black w-full">
                Plans
              </Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className="py-1 text-black">
            <List className="ml-1 text-black">
              <Link href={"/feature"}>
                <ListItem className="ml-1 text-black">
                  <ListItemPrefix>
                    <GalleryVerticalEnd size={20} />
                  </ListItemPrefix>
                  Feature
                </ListItem>
              </Link>
              <Link href={"/subscription"}>
                <ListItem className="ml-1 text-black">
                  <ListItemPrefix>
                    <Plus size={20} />
                  </ListItemPrefix>
                  Subscription Plan
                </ListItem>
              </Link>
            </List>
          </AccordionBody>
        </Accordion>
        <Link href={"/hadeeth"}>
          <ListItem className="text-black">
            <ListItemPrefix>
              <CircleUserRound size={20} />
            </ListItemPrefix>
            Hadeeth
          </ListItem>
        </Link>
        <Link href={"/adhkar"}>
          <ListItem className="text-black">
            <ListItemPrefix>
              <CircleUserRound size={20} />
            </ListItemPrefix>
            Adhkar
          </ListItem>
        </Link>
        <Link href={"/usersubscription"}>
          <ListItem className="text-black">
            <ListItemPrefix>
              <CircleUserRound size={20} />
            </ListItemPrefix>
            User Supscription
          </ListItem>
        </Link>
        <a
          onClick={handleLogout}
          style={{ bottom: "50px", left: "90px" }}
          className=" fixed text-center text-black z-10 cursor-pointer"
        >
          <Space>
            <Power size={20} />
            <h4 className="font-bold text-black">LOGOUT</h4>
          </Space>
        </a>
      </List>
    </Card>
  );
};

export default Sidebar;
