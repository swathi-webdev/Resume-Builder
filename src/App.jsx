
import { useEffect, useState } from "react";

const STORAGE_KEY = "resume-builder-data"; 

const inputStyle =
  "w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

const emptyResume = {
  name: "",
  role: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: "",
  links: [],
  education: [],
  experience: [],
  projects: [],
};


function loadResume() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyResume; 

    const parsed = JSON.parse(saved);

    return {
      ...emptyResume,
      ...parsed,
      links: Array.isArray(parsed.links) ? parsed.links : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
  } catch {
    return emptyResume;
  }
}

 
function cleanSummaryText(text) {
  if (!text) return "";
 
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => { 
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (!lines.length) return "";

      const isBulletList = lines.every((line) => /^[-*•]\s*/.test(line));
      if (isBulletList) {
        return lines.join("\n");
      }
     
      // Merge lines within the paragraph into continuous text
      return lines.join(" ");
    })
    .filter(Boolean)
    .join("\n\n");
}

function renderSummaryContent(text) {
  if (!text || !text.trim()) return null;

  const blocks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/);

  return blocks.map((block, blockIndex) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) return null;

    const isBulletList = lines.every((line) => /^[-*•]\s*/.test(line));

    if (isBulletList) {
      return (
        <ul
          key={blockIndex}
          className="mb-2 list-disc pl-5 space-y-1 text-sm text-gray-700"
        >
          {lines.map((line, lineIndex) => (
            <li
              key={lineIndex}
              className="text-justify leading-relaxed break-words"
              style={{ textAlign: "justify", textJustify: "inter-word" }}
            >
              {line.replace(/^[-*•]\s*/, "")}
            </li>
          ))}
        </ul>
      );
    }

    const continuousText = lines.join(" ");

    return (
      <p
        key={blockIndex}
        className="mb-2 last:mb-0 text-justify text-sm leading-relaxed text-gray-700 break-words"
        style={{ textAlign: "justify", textJustify: "inter-word" }}
      >
        {continuousText}
      </p>
    );
  });
}

function Field({
  label,
  name,
  value,
  onChange,
  onPaste,
  multiline = false,
  type = "text",
  placeholder = "",
  action = null,
}) {
  const Component = multiline ? "textarea" : "input";

  return (
    <label className="mb-3 block min-w-0">
      <div className="mb-1 flex items-center justify-between">
        <span className="block text-sm font-medium text-gray-700">
          {label}
        </span>
        {action}
      </div>

      <Component
        type={multiline ? undefined : type}
        name={name}
        value={value}
        onChange={onChange}
        onPaste={onPaste}
        placeholder={placeholder}
        className={`${inputStyle} ${multiline ? "resize-y" : ""}`}
        rows={multiline ? 4 : undefined}
        required={["name", "email"].includes(name)}
      />
    </label>
  );
}

function ListFields({
  section,
  title,
  fields,
  items,
  onAdd,
  onUpdate,
  onRemove,
}) {
  return (
    <section className="mb-5">
      <h3 className="mb-3 text-lg font-bold">{title}</h3>
      

      {items.map((item, index) => (
        <div
          key={index}
          className="mb-3 rounded-md border border-gray-200 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">
              {title} {index + 1}
            </h4>

            <button
              type="button"
              onClick={() => onRemove(section, index)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>

          {fields.map((field) => (
            <label key={field.key} className="mb-3 block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                {field.label}
              </span>

              <textarea
                rows={field.multiline ? 3 : 1}
                value={item[field.key] || ""}
                onChange={(e) =>
                  onUpdate(section, index, field.key, e.target.value)
                }
                className={`${inputStyle} resize-y`}
              />
            </label>
          ))}
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onAdd(
            section,
            Object.fromEntries(fields.map((field) => [field.key, ""]))
          )
        }
        className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
      >
        + Add {title}
      </button>
    </section>
  );
}

function LinksFields({ links, onAdd, onUpdate, onRemove }) {
  return (
    <section className="mb-5">
      <h3 className="mb-3 text-lg font-bold">Social & Portfolio Links</h3>

      {links.map((link, index) => (
        <div
          key={link.id}
          className="mb-3 rounded-md border border-gray-200 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Link {index + 1}</h4>

            <button
              type="button"
              onClick={() => onRemove(link.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Link Name
            </span>
            <select
              value={link.label}
              onChange={(e) => onUpdate(link.id, "label", e.target.value)}
              className={inputStyle}
            >
              <option value="">Select link type</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="GitHub">GitHub</option>
              <option value="LeetCode">LeetCode</option>
              <option value="Portfolio">Portfolio</option>
              <option value="Other">Other</option>
            </select>
          </label>

          {link.label === "Other" && (
            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Custom Link Name
              </span>
              <input
                value={link.customLabel || ""}
                onChange={(e) =>
                  onUpdate(link.id, "customLabel", e.target.value)
                }
                placeholder="e.g. Personal Website"
                className={inputStyle}
              />
            </label>
            
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              URL
            </span>
            <input
              type="url"
              value={link.url}
              onChange={(e) => onUpdate(link.id, "url", e.target.value)}
              placeholder="https://..."
              className={inputStyle}
            />
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <span className="text-lg leading-none">+</span>
        Add Link
      </button>
    </section>
  );
}

function PreviewSection({ title, items, fields }) {
  const visibleItems = items.filter((item) =>
    fields.some((field) => String(item[field.key] || "").trim())
  );

  if (!visibleItems.length) return null; 

  return (
    <section className="mt-3 min-w-0">
      <h2 className="mb-2 border-b border-blue-600 pb-1 text-sm font-bold uppercase tracking-wide text-blue-700">
        {title}
      </h2>

      {visibleItems.map((item, index) => (
        <div key={index} className="mb-2 min-w-0 break-words">
          {fields.map((field) => {
            const value = String(item[field.key] || "").trim();
            if (!value) return null;

            if (field.multiline) {
              return (
                <div key={field.key} className="mb-1">
                  {renderSummaryContent(value)}
                </div>
              );
            }

            return (
              <p
                key={field.key}
                className={`mb-1 break-words whitespace-pre-wrap text-sm leading-5 ${
                  field.emphasis
                    ? "font-semibold text-gray-900"
                    : "text-gray-700"
                }`}
              >
                {value}
              </p>
            );
          })}
        </div>
      ))} 
    </section>
  );
}

function SkillsPreview({ skills }) {
  if (!skills.trim()) return null;

  const lines = skills
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const entries = lines.flatMap((line) => {
    const cleanLine = line.replace(/^[-•*]\s*/, "");
    const match = cleanLine.match(/^([^:]{1,45}):\s*(.*)$/);

    if (match) {
      return [{ label: match[1].trim(), value: match[2].trim() }];
    }

    return cleanLine
      .split(/[,;]+/)
      .map((skill) => skill.trim())
      .filter(Boolean)
      .map((skill) => ({ label: "", value: skill }));
  });

  return (
    <section className="mt-3 min-w-0">
      <h2 className="mb-2 border-b border-blue-600 pb-1 text-sm font-bold uppercase tracking-wide text-blue-700">
        Technical Skills
      </h2>

      <div className="space-y-1 text-sm leading-5 text-gray-900">
        {entries.map((entry, index) => (
          <p key={`${entry.label}-${index}`} className="break-words">
            {entry.label && (
              <strong className="font-semibold">{entry.label}: </strong>
            )}
            {entry.value}
          </p>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [resume, setResume] = useState(loadResume);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    } catch (error) {
      console.error("Unable to save resume:", error);
    }
  }, [resume]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "name" && !/^[A-Za-z .'-]*$/.test(value)) return;
    if (name === "phone" && !/^[0-9+() -]*$/.test(value)) return;
    if (name === "phone" && value.length > 15) return;

    setResume((prev) => ({ ...prev, [name]: value }));
  }

  function handleSummaryPaste(e) {
    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    e.preventDefault();
    const cleanedText = cleanSummaryText(pastedText);

    const target = e.target;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    const current = resume.summary || "";
    const updated =
      current.substring(0, start) + cleanedText + current.substring(end);

    setResume((prev) => ({ ...prev, summary: updated }));

    setTimeout(() => {
      target.selectionStart = target.selectionEnd = start + cleanedText.length;
    }, 0);
  }

  function addItem(section, item) {
    setResume((prev) => ({
      ...prev,
      [section]: [...prev[section], item],
    }));
  }

  function updateItem(section, index, field, value) {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function removeItem(section, index) {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  }

  function addLink() {
    setResume((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          label: "",
          customLabel: "",
          url: "",
        },
      ],
    }));
  }

  function updateLink(id, field, value) {
    setResume((prev) => ({ 
      ...prev,
      links: prev.links.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    }));
  }

  function removeLink(id) {
    setResume((prev) => ({
      ...prev,
      links: prev.links.filter((link) => link.id !== id),
    }));
  }

  const sections = [
    {
      section: "education",
      title: "Education",
      fields: [
        { key: "degree", label: "Degree", emphasis: true },
        { key: "school", label: "College / University" },
        { key: "year", label: "Year" },
        { key: "score", label: "Grade / CGPA" },
      ],
    }, 
    {
      section: "experience",
      title: "Experience",
      fields: [
        { key: "role", label: "Job Title", emphasis: true },
        { key: "company", label: "Company" },
        { key: "duration", label: "Duration" },
        {
          key: "description",
          label: "Responsibilities",
          multiline: true,
        },
      ],
    },
    {
      section: "projects",
      title: "Projects",
      fields: [
        { key: "name", label: "Project Name", emphasis: true },
        { key: "description", label: "Description", multiline: true },
        { key: "technologies", label: "Technologies Used" },
      ],
    },
  ];

  const hasContactDetails = [
    resume.name,
    resume.role,
    resume.email,
    resume.phone,
    resume.location,
  ].some((value) => value.trim());

  const visibleLinks = resume.links.filter(
    (link) => link.label && link.url.trim()
  );

  const handlePrint = (e) => {
    e.preventDefault();
    const originalTitle = document.title;
    // Set a clean name for PDF saving and ensure no "resume-builder" unwanted header appears
    document.title = resume.name.trim() ? `${resume.name.trim()} - Resume` : "Resume";
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      <header className="no-print mb-3 text-center">
        <h1 className="text-2xl font-bold text-blue-700">Resume Builder</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your details and create your professional resume.
        </p>
      </header>
      
      <main className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-3 md:grid-cols-2">
        <form
          className="no-print min-w-0 rounded-lg bg-white p-3 shadow-sm"
          onSubmit={handlePrint}
        >
          <h2 className="mb-3 text-xl font-bold">Your Details</h2>

          <Field label="Full Name" name="name" value={resume.name} onChange={handleChange} />
          <Field label="Job Title" name="role" value={resume.role} onChange={handleChange} />
          <Field label="Email" name="email" type="email" value={resume.email} onChange={handleChange} />
          <Field label="Phone" name="phone" type="tel" value={resume.phone} onChange={handleChange} />
          <Field label="Location" name="location" value={resume.location} onChange={handleChange} />
          <Field
            label="Professional Summary"
            name="summary"
            value={resume.summary}
            onChange={handleChange}
            onPaste={handleSummaryPaste}
            multiline
            action={
              resume.summary.trim() ? (
                <button
                  type="button"
                  onClick={() =>
                    setResume((prev) => ({
                      ...prev,
                      summary: cleanSummaryText(prev.summary),
                    }))
                  }
                  className="text-xs font-semibold text-blue-600 hover:underline"
                  title="Remove awkward line breaks and align text"
                >
                  Auto-align text
                </button>
              ) : null
            }
          />
          <Field
            label="Technical Skills "
            name="skills"
            value={resume.skills}
            onChange={handleChange}
            multiline
          />

          <LinksFields
            links={resume.links}
            onAdd={addLink}
            onUpdate={updateLink}
            onRemove={removeLink}
          />

          {sections.map((section) => (
            <ListFields
              key={section.section}
              {...section}
              items={resume[section.section]}
              onAdd={addItem}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}

          <button
            type="submit"
            className="w-full rounded-md bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700"
          >
            Print / Save as PDF
          </button>
        </form>

        <article className="resume-paper box-border w-full min-w-0 bg-white p-4 shadow-sm md:p-5">
          <header
            className={`pb-2 ${
              hasContactDetails ? "mb-2 border-b-2 border-blue-600" : ""
            }`}
          >
            {resume.name.trim() && (
              <h1 className="break-words text-2xl font-bold">{resume.name}</h1>
            )}

            {resume.role.trim() && (
              <p className="mt-1 break-words text-base text-blue-700">{resume.role}</p>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-y-1 text-xs text-gray-600">
              {[resume.email, resume.phone, resume.location]
                .filter((value) => value.trim())
                .map((value, index, arr) => (
                  <span key={index} className="inline-flex items-center">
                    <span className="break-all">{value}</span>
                    {index < arr.length - 1 && (
                      <span className="mx-2 text-gray-400 select-none">|</span>
                    )}
                  </span>
                ))}
            </div>

            {visibleLinks.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-y-1 text-xs">
                {visibleLinks.map((link, index) => (
                  <span key={link.id} className="inline-flex items-center">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-blue-700 underline"
                    >
                      {link.label === "Other"
                        ? link.customLabel || "Website"
                        : link.label}
                    </a>
                    {index < visibleLinks.length - 1 && (
                      <span className="mx-2 text-gray-400 select-none">|</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </header>

          {resume.summary.trim() && (
            <section className="mt-3 min-w-0">
              <h2 className="mb-2 border-b border-blue-600 pb-1 text-sm font-bold uppercase tracking-wide text-blue-700">
                Professional Summary
              </h2>
              <div className="space-y-1">
                {renderSummaryContent(resume.summary)}
              </div>
            </section>
          )}

          <SkillsPreview skills={resume.skills} />

          {sections.map((section) => (
            <PreviewSection
              key={section.section}
              title={section.title}
              items={resume[section.section]}
              fields={section.fields}
            />
          ))}
        </article>
      </main>
    </div>
  );
}

export default App;
