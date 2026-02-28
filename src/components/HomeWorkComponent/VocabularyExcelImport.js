import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Input,
  Select,
  Upload,
  message,
  Space,
  Typography,
  Progress,
  Popconfirm,
  Tag,
  Tooltip,
  Alert,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  PictureOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import homeWorkService from "services/homeWorkService";
import vocabularyService from "services/vocabularyService";
import fileService from "services/fileService";
import PropTypes from "prop-types";

const { Text } = Typography;

/**
 * VocabularyExcelImport
 * Cho phép giáo viên/quản lý import hàng loạt từ vựng từ file Excel.
 * Mỗi dòng có: chỉnh sửa inline, chọn giọng TTS riêng, upload ảnh + preview, xóa.
 * Khi Xác nhận: sinh audio TTS, upload ảnh, rồi gọi bulk-create API.
 */
const VocabularyExcelImport = ({
  selectedHomeWorkId,
  vocabularyList,
  setVocabularyList,
  isMobile,
}) => {
  const [rows, setRows] = useState([]);
  const [voices, setVoices] = useState([]);
  const [defaultVoice, setDefaultVoice] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editingKey, setEditingKey] = useState(null);
  const [editingData, setEditingData] = useState({});

  // ─────────────────────────────────────────────────────────────
  // Fetch voices on mount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const resData = await homeWorkService.voices();
        setVoices(resData || []);
        setDefaultVoice(resData?.[0] || null);
      } catch {
        message.error("Không thể tải danh sách giọng đọc");
      }
    };
    fetchVoices();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Download Excel template
  // ─────────────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const wsData = [
      ["Từ / Word", "Định nghĩa / Definition"],
      ["apple", "a round fruit with red or green skin and a firm white flesh"],
      ["book", "a written or printed work consisting of pages bound together"],
      ["happy", "feeling or showing pleasure or contentment"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 30 }, { wch: 60 }];

    // Style header row bold (basic)
    ["A1", "B1"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = { font: { bold: true } };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Từ vựng");
    XLSX.writeFile(wb, "template_tu_vung.xlsx");
    message.success("Đã tải mẫu Excel thành công!");
  };

  // ─────────────────────────────────────────────────────────────
  // Parse uploaded Excel file
  // ─────────────────────────────────────────────────────────────
  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        // Skip header row (row 0), filter empty word rows
        const parsedRows = jsonData
          .slice(1)
          .filter((row) => row[0] && String(row[0]).trim() !== "")
          .map((row, index) => ({
            id: `import_${Date.now()}_${index}`,
            word: String(row[0] || "").trim(),
            definition: String(row[1] || "").trim(),
            voice: defaultVoice,
            imageUrl: null,
            imageFile: null,
            imagePreview: null,
            status: "pending", // pending | processing | done | error
          }));

        if (parsedRows.length === 0) {
          message.warning(
            "Không tìm thấy dữ liệu hợp lệ trong file. Hãy kiểm tra lại định dạng."
          );
          return;
        }

        setRows((prev) => [...prev, ...parsedRows]);
        message.success(
          `Đã đọc thành công ${parsedRows.length} từ vựng từ file Excel!`
        );
      } catch (error) {
        message.error("Lỗi đọc file Excel: " + (error.message || "Unknown error"));
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent antd auto-upload
  };

  // ─────────────────────────────────────────────────────────────
  // Image select per row (no upload yet, just preview locally)
  // ─────────────────────────────────────────────────────────────
  const handleImageSelect = (rowId, file) => {
    const preview = URL.createObjectURL(file);
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, imageFile: file, imagePreview: preview } : r))
    );
    return false;
  };

  // ─────────────────────────────────────────────────────────────
  // Delete a row
  // ─────────────────────────────────────────────────────────────
  const handleDeleteRow = (rowId) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    message.success("Đã xóa từ vựng khỏi danh sách");
  };

  // ─────────────────────────────────────────────────────────────
  // Inline editing
  // ─────────────────────────────────────────────────────────────
  const startEdit = (row) => {
    setEditingKey(row.id);
    setEditingData({ word: row.word, definition: row.definition });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingData({});
  };

  const saveEdit = (rowId) => {
    if (!editingData.word?.trim()) {
      message.error("Từ không được để trống");
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, word: editingData.word.trim(), definition: editingData.definition?.trim() || "" }
          : r
      )
    );
    setEditingKey(null);
    setEditingData({});
    message.success("Đã cập nhật từ vựng");
  };

  // ─────────────────────────────────────────────────────────────
  // Voice change per row
  // ─────────────────────────────────────────────────────────────
  const handleVoiceChange = (rowId, voice) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, voice } : r)));
  };

  // ─────────────────────────────────────────────────────────────
  // Helper: convert base64 → Blob
  // ─────────────────────────────────────────────────────────────
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  };

  // ─────────────────────────────────────────────────────────────
  // Xác nhận — bulk process + create
  // Chế độ CREATE (selectedHomeWorkId = null/undefined):
  //   → thêm vào vocabularyList với isNew:true, lưu khi submit form
  // Chế độ EDIT (selectedHomeWorkId có giá trị):
  //   → gọi API bulkCreate trực tiếp
  // ─────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (rows.length === 0) {
      message.warning("Không có từ vựng nào để xử lý");
      return;
    }

    const isCreateMode = !selectedHomeWorkId;

    setIsConfirming(true);
    setProgress(0);

    const total = rows.length;
    const processedRows = rows.map((r) => ({ ...r }));
    // For EDIT mode: collect DTOs for bulk API call
    const vocabularyDtos = [];
    // For CREATE mode: collect items to push into vocabularyList
    const newVocabItems = [];

    for (let i = 0; i < total; i++) {
      const row = rows[i];

      processedRows[i] = { ...processedRows[i], status: "processing" };
      setRows([...processedRows]);

      let audioUrl = null;
      let imageUrl = row.imageUrl || null;

      // 1. Generate TTS audio
      if (row.word && row.voice) {
        try {
          const base64Audio = await homeWorkService.textToSpeech({
            textToSpeech: row.word.replace(/\n/g, ".."),
            voice: row.voice,
          });
          const audioBlob = base64ToBlob(base64Audio, "audio/mp3");
          const audioFile = new File([audioBlob], `vocab_tts_${Date.now()}_${i}.mp3`, {
            type: "audio/mp3",
          });
          audioUrl = await fileService.upload(audioFile, audioFile.name);
        } catch (err) {
          console.error(`[TTS] Error for "${row.word}":`, err);
        }
      }

      // 2. Upload image if user selected one
      if (row.imageFile) {
        try {
          imageUrl = await fileService.upload(row.imageFile, row.imageFile.name);
        } catch (err) {
          console.error(`[Image] Upload error for "${row.word}":`, err);
        }
      }

      if (isCreateMode) {
        // CREATE mode: build item compatible with vocabularyList state
        newVocabItems.push({
          id: Date.now() + i,
          word: row.word,
          definition: row.definition || null,
          imageUrl: imageUrl || null,
          audioUrl: audioUrl || null,
          audioFile: null,
          isNew: true,
        });
      } else {
        // EDIT mode: build DTO for API
        vocabularyDtos.push({
          textToSpeech: row.word,
          definition: row.definition || null,
          audioUrl: audioUrl || null,
          imageUrl: imageUrl || null,
          homeworkId: selectedHomeWorkId,
          isDelete: false,
        });
      }

      processedRows[i] = { ...processedRows[i], status: "done" };
      setRows([...processedRows]);
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    try {
      if (isCreateMode) {
        // CREATE mode: add to local list — will be saved when form is submitted
        setVocabularyList([...vocabularyList, ...newVocabItems]);
        message.success(
          `Đã thêm ${newVocabItems.length} từ vựng vào danh sách. Nhấn "Lưu bài tập" để hoàn tất.`
        );
      } else {
        // EDIT mode: bulk create via API
        const created = await vocabularyService.bulkCreateVocabulary(vocabularyDtos);
        setVocabularyList([...vocabularyList, ...created]);
        message.success(`Đã tạo thành công ${created.length} từ vựng!`);
      }

      setTimeout(() => {
        setRows([]);
        setProgress(0);
      }, 1500);
    } catch (err) {
      message.error("Lỗi khi tạo từ vựng hàng loạt: " + err);
    }

    setIsConfirming(false);
  };

  // ─────────────────────────────────────────────────────────────
  // Status tag helper
  // ─────────────────────────────────────────────────────────────
  const renderStatusTag = (status) => {
    switch (status) {
      case "processing":
        return (
          <Tag icon={<LoadingOutlined />} color="processing">
            Xử lý
          </Tag>
        );
      case "done":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Xong
          </Tag>
        );
      case "error":
        return <Tag color="error">Lỗi</Tag>;
      default:
        return <Tag color="default">Chờ</Tag>;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Table columns definition
  // ─────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 50,
      align: "center",
      render: (_, __, index) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {index + 1}
        </Text>
      ),
    },
    {
      title: "Từ / Word",
      dataIndex: "word",
      key: "word",
      width: 160,
      render: (word, record) =>
        editingKey === record.id ? (
          <Input
            value={editingData.word}
            onChange={(e) => setEditingData((prev) => ({ ...prev, word: e.target.value }))}
            size="small"
            autoFocus
          />
        ) : (
          <Text strong style={{ wordBreak: "break-word" }}>
            {word}
          </Text>
        ),
    },
    {
      title: "Định nghĩa",
      dataIndex: "definition",
      key: "definition",
      render: (definition, record) =>
        editingKey === record.id ? (
          <Input.TextArea
            value={editingData.definition}
            onChange={(e) =>
              setEditingData((prev) => ({ ...prev, definition: e.target.value }))
            }
            size="small"
            rows={2}
            placeholder="Nhập định nghĩa..."
          />
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {definition || <em style={{ color: "#ccc" }}>Chưa có</em>}
          </Text>
        ),
    },
    {
      title: "Giọng đọc",
      dataIndex: "voice",
      key: "voice",
      width: 145,
      render: (voice, record) => (
        <Select
          value={voice}
          onChange={(v) => handleVoiceChange(record.id, v)}
          size="small"
          style={{ width: "100%" }}
          placeholder="Chọn giọng"
          options={voices.map((item) => ({
            label: item?.split("_")[1] || item,
            value: item,
          }))}
          disabled={isConfirming}
        />
      ),
    },
    {
      title: "Ảnh minh hoạ",
      key: "image",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            justifyContent: "center",
          }}
        >
          {record.imagePreview && (
            <img
              src={record.imagePreview}
              alt="preview"
              style={{
                width: 38,
                height: 38,
                objectFit: "cover",
                borderRadius: 4,
                border: "1px solid #d9d9d9",
                flexShrink: 0,
              }}
            />
          )}
          <Upload
            showUploadList={false}
            beforeUpload={(file) => handleImageSelect(record.id, file)}
            accept="image/*"
            disabled={isConfirming}
          >
            <Tooltip title={record.imagePreview ? "Đổi ảnh" : "Chọn ảnh"}>
              <Button
                size="small"
                icon={<PictureOutlined />}
                disabled={isConfirming}
              >
                {!record.imagePreview && !isMobile && "Chọn ảnh"}
              </Button>
            </Tooltip>
          </Upload>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 88,
      align: "center",
      render: (_, record) => renderStatusTag(record.status),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 95,
      align: "center",
      render: (_, record) => {
        if (editingKey === record.id) {
          return (
            <Space>
              <Tooltip title="Lưu">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => saveEdit(record.id)}
                />
              </Tooltip>
              <Tooltip title="Hủy">
                <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit} />
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space>
            <Tooltip title="Chỉnh sửa">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => startEdit(record)}
                disabled={isConfirming}
              />
            </Tooltip>
            <Popconfirm
              title="Xóa từ này khỏi danh sách?"
              onConfirm={() => handleDeleteRow(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              disabled={isConfirming}
            >
              <Tooltip title="Xóa">
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={isConfirming}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Mode banner ── */}
      {!selectedHomeWorkId ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12, fontSize: 12 }}
          message={
            <span>
              <strong>Chế độ Tạo bài tập mới:</strong> Sau khi bấm Xác nhận, từ vựng sẽ được
              thêm vào danh sách chờ. Bạn cần bấm{" "}
              <strong>&quot;Lưu bài tập&quot;</strong> hoặc{" "}
              <strong>&quot;Lưu và gửi&quot;</strong> để lưu vào hệ thống.
            </span>
          }
        />
      ) : (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 12, fontSize: 12 }}
          message={
            <span>
              <strong>Chế độ Chỉnh sửa bài tập:</strong> Các từ vựng sẽ được lưu trực tiếp
              vào bài tập ngay khi bạn bấm Xác nhận.
            </span>
          }
        />
      )}

      {/* ── Header actions ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 36 }}>
        <Tooltip title="Tải mẫu Excel gồm 2 cột: Từ và Định nghĩa">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            style={{ minWidth: 150, height: 36 }}
          >
            Tải mẫu Excel
          </Button>
        </Tooltip>

        <Upload
          showUploadList={false}
          beforeUpload={handleExcelUpload}
          accept=".xlsx,.xls,.csv"
          disabled={isConfirming}
        >
          <Button
            icon={<FileExcelOutlined />}
            type="primary"
            disabled={isConfirming}
            style={{
              backgroundColor: "#217346",
              borderColor: "#217346",
              minWidth: 150,
              height: 36,
              marginTop: 27,
            }}
          >
            Upload file Excel
          </Button>
        </Upload>

        {rows.length > 0 && (
          <Tag color="blue" style={{ fontSize: 13, padding: "4px 10px", lineHeight: "28px", marginLeft: 72 }}>
            {rows.length} từ vựng
          </Tag>
        )}

        {rows.length > 0 && !isConfirming && (
          <Button
            danger
            style={{ height: 36 }}
            onClick={() => {
              setRows([]);
              setProgress(0);
            }}
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* ── Instructions ── */}
      {rows.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            border: "2px dashed #d9d9d9",
            borderRadius: 8,
            backgroundColor: "#fafafa",
          }}
        >
          <FileExcelOutlined
            style={{ fontSize: 52, color: "#217346", marginBottom: 12, display: "block" }}
          />
          <Text style={{ display: "block", marginBottom: 6, fontSize: 15 }}>
            Upload file Excel để import từ vựng hàng loạt
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Định dạng hỗ trợ: <strong>.xlsx</strong>, <strong>.xls</strong> —{" "}
            <strong>Cột A:</strong> Từ &nbsp;|&nbsp; <strong>Cột B:</strong> Định nghĩa
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Nhấn <strong>&quot;Tải mẫu Excel&quot;</strong> để lấy file mẫu chuẩn.
          </Text>
        </div>
      )}

      {/* ── Preview table ── */}
      {rows.length > 0 && (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12, fontSize: 12 }}
            message={
              <span>
                Kiểm tra lại dữ liệu. Chọn<strong> giọng TTS</strong> cho từng từ, tải lên{" "}
                <strong>ảnh minh hoạ</strong> nếu cần, rồi nhấn{" "}
                <strong>Xác nhận để tạo</strong>.
              </span>
            }
          />

          <Table
            dataSource={rows}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: isMobile ? 600 : 900, y: 380 }}
            style={{ marginBottom: 16 }}
            rowClassName={(record) =>
              record.status === "done"
                ? "excel-row-done"
                : record.status === "error"
                ? "excel-row-error"
                : ""
            }
          />

          {/* ── Progress bar (visible during confirm) ── */}
          {isConfirming && (
            <Progress
              percent={progress}
              status={progress === 100 ? "success" : "active"}
              strokeColor={{ from: "#108ee9", to: "#87d068" }}
              style={{ marginBottom: 12 }}
            />
          )}

          {/* ── Confirm button ── */}
          <Button
            type="primary"
            size="large"
            icon={isConfirming ? <LoadingOutlined /> : <CheckOutlined />}
            onClick={handleConfirm}
            loading={isConfirming}
            disabled={isConfirming}
            block
            style={{
              backgroundColor: "#389e0d",
              borderColor: "#389e0d",
              height: 44,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {isConfirming
              ? `Đang xử lý ${Math.min(
                  Math.round(progress / (100 / rows.length)) + 1,
                  rows.length
                )}/${rows.length} từ... (${progress}%)`
              : selectedHomeWorkId
              ? `Xác nhận thêm ${rows.length} từ vựng vào bài tập này`
              : `Xác nhận thêm ${rows.length} từ vựng vào danh sách`}
          </Button>
        </>
      )}

      {/* Row highlight styles */}
      <style>{`
        .excel-row-done td { background-color: #f6ffed !important; }
        .excel-row-error td { background-color: #fff2f0 !important; }
      `}</style>
    </div>
  );
};

VocabularyExcelImport.propTypes = {
  selectedHomeWorkId: PropTypes.number, // optional — undefined = create mode
  vocabularyList: PropTypes.array.isRequired,
  setVocabularyList: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

VocabularyExcelImport.defaultProps = {
  selectedHomeWorkId: null,
};

export default VocabularyExcelImport;
