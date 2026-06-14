import { useEffect, useState } from "react";
import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authMode, setAuthMode] = useState("login");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const loginData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setMessage("");
      } else {
        setMessage(data.error || "Invalid email or password");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    const registerData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Account created successfully. You can now log in.");
        setAuthMode("login");
      } else {
        setMessage(data.error || "Could not create account.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setLeads([]);
    setMessage("");
  };

  const loadLeads = async () => {
    const res = await fetch("http://localhost:3000/contacts", {
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setLeads(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const contact = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: phone ? "+" + phone : "",
    };

    try {
      if (editingContact) {
        await fetch(`http://localhost:3000/contacts/${editingContact._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(contact),
        });

        setMessage("Contact successfully updated!");
      } else {
        await fetch("http://localhost:3000/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(contact),
        });

        setMessage("Contact successfully added!");
      }

      e.target.reset();
      setPhone("");
      setEditingContact(null);
      await loadLeads();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:3000/contacts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      await loadLeads();
      setMessage("Contact successfully deleted!");
    } catch (err) {
      console.log(err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const startEditContact = (contact) => {
    setEditingContact(contact);
    setPhone(contact.phone ? contact.phone.replace("+", "") : "");

    setTimeout(() => {
      document.querySelector('input[name="name"]').value = contact.name;
      document.querySelector('input[name="email"]').value = contact.email;
    }, 0);
  };

  const cancelEdit = () => {
    setEditingContact(null);
    setPhone("");
    document.querySelector('input[name="name"]').value = "";
    document.querySelector('input[name="email"]').value = "";
  };

  useEffect(() => {
    if (token) {
      loadLeads();
    }
  }, [token]);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">🦥🔐</div>

            <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">
              Sid&apos;s Automations
            </p>

            <h1 className="text-3xl font-black text-slate-800 mt-3">
              {authMode === "login" ? "Login" : "Create Account"}
            </h1>

            <p className="text-slate-500 mt-2">
              {authMode === "login"
                ? "Access your Contact Manager dashboard."
                : "Create your account to start managing contacts."}
            </p>
          </div>

          <form
            onSubmit={authMode === "login" ? handleLogin : handleRegister}
            className="flex flex-col gap-3"
          >
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="border border-slate-200 bg-slate-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="border border-slate-200 bg-slate-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button className="bg-blue-600 text-white font-bold p-3 rounded-xl hover:bg-blue-700 transition">
              {authMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setAuthMode(authMode === "login" ? "register" : "login");
            }}
            className="w-full text-sm text-blue-600 font-bold mt-4 hover:underline"
          >
            {authMode === "login"
              ? "Create a new account"
              : "Already have an account? Login"}
          </button>

          {message && (
            <p className="text-center text-sm font-semibold text-red-500 mt-4">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <div className="flex justify-end mb-2">
          <button
            onClick={logout}
            className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold hover:bg-slate-300"
          >
            Logout
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🦥👋</div>
          <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">
            Welcome to Sid&apos;s Automations
          </p>

          <h1 className="text-3xl font-black text-slate-800 mt-3">
            Contact Manager
          </h1>

          <p className="text-slate-500 mt-2">
            Add, store, edit, and manage contacts in real time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
            <p className="text-sm text-slate-500">Total Contacts</p>
            <p className="text-3xl font-black text-blue-600">{leads.length}</p>
          </div>

          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
            <p className="text-sm text-slate-500">System Status</p>
            <p className="text-xl font-black text-green-600">Online</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-5">
          <input
            name="name"
            placeholder="Contact Name"
            required
            className="border border-slate-200 bg-slate-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="email"
            type="email"
            placeholder="Contact Email"
            required
            className="border border-slate-200 bg-slate-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <PhoneInput
            country="br"
            value={phone}
            onChange={(value) => setPhone(value)}
            inputStyle={{
              width: "100%",
              height: "48px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          />

          <button
            disabled={loading}
            className="bg-blue-600 text-white font-bold p-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : editingContact
              ? "Update Contact"
              : "Add Contact"}
          </button>

          {editingContact && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-200 text-gray-700 font-bold p-3 rounded-xl hover:bg-gray-300 transition"
            >
              Cancel Edit
            </button>
          )}
        </form>

        {message && (
          <p className="text-center text-sm font-semibold text-slate-600 mb-5">
            {message}
          </p>
        )}

        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <h2 className="text-lg font-bold text-slate-800 mb-3">
          Added Contacts
        </h2>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {leads.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No contacts yet</p>
          ) : (
            filteredLeads.map((lead, index) => (
              <div
                key={lead._id || index}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-slate-800">{lead.name}</p>
                  <p className="text-sm text-slate-500">{lead.email}</p>
                  <p className="text-sm text-slate-500">{lead.phone}</p>
                </div>

                <div className="flex gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                    Added
                  </span>

                  <button
                    onClick={() => startEditContact(lead)}
                    className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold hover:bg-yellow-200"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteContact(lead._id)}
                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}