import React, { useState, useEffect, useRef } from "react";
import "./Courses.css";
 
const COURSES_KEY = "focusflow_courses_v1";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

function loadCourses() {
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveCourses(c) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(c));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function Courses() {
  const [courses, setCourses] = useState(() => loadCourses());
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialFile, setMaterialFile] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  const addCourse = () => {
    const t = title.trim();
    if (!t) return;
    const newC = { id: uid(), title: t, description: desc.trim(), materials: [], createdAt: Date.now() };
    setCourses([newC, ...courses]);
    setTitle("");
    setDesc("");
  };

  const removeCourse = (id) => {
    if (!confirm("Biztosan törlöd a tantárgyat?")) return;
    setCourses(courses.filter((c) => c.id !== id));
    if (selectedCourseId === id) setSelectedCourseId(null);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setMaterialFile(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      alert("A fájl túl nagy. Maximum 5 MB engedélyezett.");
      e.target.value = "";
      setMaterialFile(null);
      return;
    }
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) {
      alert("Csak PDF és Word (.doc, .docx) fájlok engedélyezettek.");
      e.target.value = "";
      setMaterialFile(null);
      return;
    }
    setMaterialFile(f);
  };

  const readFileAsDataUrl = (file) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const addMaterial = async (courseId) => {
    const mt = materialTitle.trim();
    if (!mt && !materialFile && materialUrl.trim() === "") {
      alert("Adj meg címet, linket vagy tölts fel egy fájlt.");
      return;
    }

    let fileObj = null;
    if (materialFile) {
      try {
        const data = await readFileAsDataUrl(materialFile); // data:<mime>;base64,...
        fileObj = {
          name: materialFile.name,
          type: materialFile.type,
          size: materialFile.size,
          data,
        };
      } catch (e) {
        alert("A fájl beolvasása sikertelen.");
        return;
      }
    }

    const material = {
      id: uid(),
      title: mt || (fileObj ? fileObj.name : "Tananyag"),
      url: materialUrl.trim() || null,
      file: fileObj,
      createdAt: Date.now(),
    };

    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, materials: [...c.materials, material] } : c)));
    setMaterialTitle("");
    setMaterialUrl("");
    setMaterialFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMaterial = (courseId, materialId) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, materials: c.materials.filter((m) => m.id !== materialId) } : c)));
  };

  // small inline styles kept for top-level inputs/buttons - CSERÉLVE CSS OSZTÁLYRA
  // const btnPrimary = { padding: "8px 12px", borderRadius: 8, border: "none", color: "white", cursor: "pointer", background: "#0b7df0" };

  return (
    <section className="courses-section"> {/* ÚJ OSZTÁLY AZ INLINE STÍLUS HELYETT */}
      <h1>Tantárgyak</h1>

      <div className="course-input-group"> {/* ÚJ OSZTÁLY AZ INLINE STÍLUS HELYETT */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Új tantárgy neve"
          className="course-input" 
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Rövid leírás (opcionális)"
          className="course-input" 
        />
        <button onClick={addCourse} className="course-add-btn primary"> {/* ÚJ OSZTÁLY */}
          Hozzáad
        </button>
      </div>

      <div className="course-grid">
        {courses.map((c) => (
          <div key={c.id} className="course-card">
            <div>
              <h3 style={{ margin: 0, wordBreak: "break-word" }}>{c.title}</h3>
              {/* Leírás színe lecserélve osztályra */}
              {c.description && <p className="course-description">{c.description}</p>}
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button
                  onClick={() => setSelectedCourseId(selectedCourseId === c.id ? null : c.id)}
                  className="small-btn secondary" /* ÚJ OSZTÁLY */
                >
                  Tananyag
                </button>
                <button onClick={() => removeCourse(c.id)} className="small-btn danger">
                  Töröl
                </button>
              </div>

              {selectedCourseId === c.id && (
                <div style={{ marginTop: 8 }}>
                  <div className="materials-form-row">
                    <input value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} placeholder="Tananyag címe" className="input-full" />
                    <input value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} placeholder="URL (opcionális)" className="url-input" />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={onFileChange}
                      style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}
                    />
                    <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="small-btn">
                      {materialFile ? materialFile.name : "Feltöltés"}
                    </button>

                    <button onClick={() => addMaterial(c.id)} className="small-btn primary">
                      Hozzáad
                    </button>
                  </div>

                  <ul className="material-list">
                    {/* Szöveg színe lecserélve osztályra */}
                    {c.materials.length === 0 && <li className="no-material-text">Nincs tananyag</li>}
                    {c.materials.map((m) => (
                      <li key={m.id} className="material-item">
                        <div className="material-left">
                          <div className="material-title-wrap">
                            {m.url ? (
                              <a href={m.url} target="_blank" rel="noreferrer" className="material-title link course-tooltip" data-course-title={c.title}>
                                {m.title}
                              </a>
                            ) : (
                              <span className="material-title course-tooltip" data-course-title={c.title}>
                                {m.title}
                              </span>
                            )}

                            {m.file && <span className="material-filename course-tooltip" data-course-title={c.title}>{`(${m.file.name})`}</span>}
                          </div>

                          {m.file && (
                            <a className="file-download" href={m.file.data} download={m.file.name} title={`Letöltés: ${m.file.name}`}>
                              ⇩
                            </a>
                          )}
                        </div>

                        <div>
                          <button onClick={() => removeMaterial(c.id, m.id)} className="small-btn danger">
                            Töröl
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}