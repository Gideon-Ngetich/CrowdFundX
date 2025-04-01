import { useEffect, useState } from "react";
import { Disclosure } from "@headlessui/react";
import { BarsOutlined, CloseOutlined, TeamOutlined, HomeOutlined, BookOutlined, UsergroupAddOutlined, PhoneOutlined, FormOutlined, DownOutlined, LinkOutlined } from "@ant-design/icons";
import { Dropdown, message, Space } from 'antd';
import { NavLink, useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const [scrolling, setScrolling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const onClick = ({ key }) => {
    const clickedItem = items.find((item) => item.key === parseInt(key, 10))
    if (clickedItem && clickedItem.link) {
      window.location.href = clickedItem.link;
    }
  };

  

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };


  const navLinks = [
    { name: "Home", href: "/", icon: <HomeOutlined />, current: true },
    { name: "Campaigns", href: "/campaigns", icon: <UsergroupAddOutlined />, current: false },
    { name: "About Us", href: "/about-us", icon: <LinkOutlined />, current: false },
    { name: "Contact Us", href: "/contact-us", icon: <PhoneOutlined />, current: false },
  ];



  return (
    <>
      <Disclosure as="nav" className="relative">
        {({ open }) => (
          <div
            className={`w-full flex items-center py-4 ${scrolling ? "bg-white" : "bg-none"
              }  justify-between px-2 -z-10 h-fit bg-slate-100`}
          >
            <div className="w-full h-full item flex justify-between mx-auto max-w-[1600px] lg:pl-[0px] md:pl-[16px] pl-[16px]">
              <div className="flex items-center lg:h-[50px] w-1/4">
                <img
                  onClick={() => navigate("/")}
                  src={""}
                  alt="CrowdFundX Logo"
                  className="h-full"
                />
              </div>
              <div className=" md:w-full md:flex hidden items-center justify-center md:space-x-[30px] space-x-2 md:text-xs lg:text-[15px]">
                {navLinks.map((link) =>
                  link.dropdown ? (
                    <Dropdown key={link.name} menu={{ items: link.items, onClick }}>
                      <a className={`flex justify-center items-center space-x-1 font-semibold cursor-pointer md:text-xs lg:text-[15px] ${!scrolling && "text-black"
                        }`}>
                        {link.icon}
                        <span>{link.name}</span>
                        <DownOutlined className="text-sm" />
                      </a>
                    </Dropdown>
                  ) : (
                    <NavLink key={link.name} to={link.href} className={`font-semibold pb-2 rounded-sm flex items-center space-x-1  text-black ${!scrolling && "text-black"
                      }`}>
                      {link.icon}
                      <span>{link.name}</span>
                    </NavLink>
                  )
                )}
              </div>
              <div className="w-1/2 lg:flex hidden items-center justify-center space-x-4">

                <div className="flex gap-2 items-start justify-start">
                  
                    <span className={`flex items-center py-2 px-4 rounded-full transition-all duration-300 ${scrolling
                      ? "bg-blue text-black hover:bg-blue-600"
                      : "bg-white text-blue hover:bg-gray-100"
                      }`}><Link to={'/login'}>Login</Link></span>
                    <span className={`flex items-center py-2 px-4 rounded-full transition-all duration-300 ${scrolling
                      ? "bg-blue text-black hover:bg-blue-600"
                      : "bg-white text-blue hover:bg-gray-100"
                      }`}><Link to={'/register'}>Register</Link></span>
                </div>


              </div>

            </div>
            <div className="absolute inset-y-0 right-0 px-5 flex items-center sm:hidden">
              <Disclosure.Button
                onClick={toggleMenu}
                className="relative inline-flex items-center justify-center rounded-md pt-2 hover:text-white"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <div onClick={toggleMenu}>
                    <CloseOutlined
                      className="block h-6 w-6 text-orange"
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div onClick={toggleMenu}>
                    <BarsOutlined
                      className="block h-6 w-6 text-blue"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Disclosure.Button>
            </div>

          </div>
        )}
      </Disclosure>
      {/* Sidebar menu for small and medium screens */}
      {isOpen && (
        <div className="w-full h-auto bg-black opacity-60">
          <div className="sm:hidden relative top-0 left-0 w-full h-full pt-[80px]">
            <div className="w-full flex flex-col lg:hidden justify-start pl-6">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <Dropdown key={link.name} menu={{ items: link.items, onClick }}>
                    <a className={`flex items-center space-x-2 pb-2 font-semibold cursor-pointer ${link.current
                      ? scrolling
                        ? "text-textdark border-b-2 border-textdark"
                        : "text-black border-white"
                      : scrolling
                        ? "text-textdark"
                        : "text-black"
                      }`}>
                      {link.icon}
                      <span>{link.name}</span>
                      <DownOutlined />
                    </a>
                  </Dropdown>
                ) : (
                  <NavLink key={link.name} to={link.href} className={`font-semibold pb-2 rounded-sm flex items-center space-x-2 text-black ${!scrolling && "text-black"
                    }`}>
                    {link.icon}
                    <span>{link.name}</span>
                  </NavLink>
                )
              )}
              {/* <NavLink
                to="/programs"
                className={`font-semibold pb-2 rounded-sm text-left flex items-center space-x-2 ${scrolling ? "text-textdark" : "text-white"
                  }`}
                onClick={toggleMenu}
              >
                <FormOutlined />
                <span>Enroll Now</span>
              </NavLink> */}
              <Dropdown
                menu={{ items, onClick }}
                className={`flex items-center justify-center rounded-full transition-all py-2 w-full duration-300 cursor-pointer ${scrolling
                  ? " text-white hover:bg-orange-600"
                  : "bg- text-orange"
                  }`}
              >
                <a className="flex w-full space-x-2 text-black justify-start items-start" onClick={(e) => e.preventDefault()} target="_blank">
                  <FormOutlined />
                  <span className={`flex space-x-2 text-md w-full font-semibold ${scrolling ? "text-black " : "text-black"}`}>
                    <p><a href="https://learning.the-cube.co.ke/">The Cube Academy</a></p>
                    <DownOutlined className="gap-0 p-0 m-0" />
                  </span>

                </a>
              </Dropdown>
              <NavLink
                to="/login"
                className={`font-semibold pb-2 rounded-sm text-left flex items-center space-x-2 ${scrolling ? "text-textdark" : "text-black"
                  }`}
                onClick={toggleMenu}
              >
                <TeamOutlined />
                <span>Become a Member</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}