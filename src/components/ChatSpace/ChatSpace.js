import React, { useEffect, useRef, useState } from "react";
import {
	Button,
	CircularProgress,
	IconButton,
	InputAdornment,
	TextField,
	styled,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import SendIcon from "@mui/icons-material/Send";

const ChatSpace = () => {
	const drop = useRef(null);
	const [chatHistory, setChatHistory] = useState([]);
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploadedFile, setUploadedFile] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [messageValue, setMessageValue] = useState("");

	useEffect(() => {
		let chat = document.getElementById("chat");
		if (chat) {
			chat.scrollTop = chat?.scrollHeight;
		}
	}, [chatHistory]);

	useEffect(() => {
		drop?.current?.addEventListener("dragover", HandleDragOver);
		drop?.current?.addEventListener("drop", HandleDrop);
		return () => {
			// eslint-disable-next-line
			drop?.current?.removeEventListener("dragover", HandleDragOver);
			// eslint-disable-next-line
			drop?.current?.removeEventListener("drop", HandleDrop);
		};
		// eslint-disable-next-line
	}, []);

	const HandleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const HandleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setSelectedFile(e.dataTransfer.files[0]);
	};

	const UploadFile = () => {
		if (selectedFile) {
			const chat = {
				message: "",
				sender: "client",
				files: [selectedFile],
			};
			setChatHistory((curr) => [...curr, chat]);
			getResponse("upload");
		}
	};

	const OnMessageInputChange = (e) => {
		setMessageValue(e.target.value);
	};

	const CheckSendMessage = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			SendMessage();
		}
	};

	const SendMessage = () => {
		if (messageValue !== "") {
			const chat = {
				message: messageValue,
				sender: "client",
				files: [],
			};
			setChatHistory([...chatHistory, chat]);
			setMessageValue("");
			getResponse("question");
		}
	};

	const getResponse = async (type) => {
		setIsLoading(true);
		let formData = new FormData();
		if (type === "upload" && selectedFile) {
			formData.append("file", selectedFile);
		}
		if (type === "question" && uploadedFile) {
			formData.append("file", uploadedFile);
		}
		if (type === "question" && messageValue !== "") {
			formData.append("question", messageValue);
		}

		let url =
			type === "upload"
				? "http://localhost:5000/upload"
				: "https://generativeaidev.azurewebsites.net/fileupload";

		fetch(url, {
			method: "POST",
			body: formData,
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					setIsLoading(false);
					throw new Error("Something went wrong ...");
				}
			})
			.then((data) => {
				const chat = {
					message: type === "upload" ? "" : data.answer,
					sender: "bot",
					files: type === "upload" ? [data] : [],
				};
				setChatHistory((curr) => [...curr, chat]);
				setUploadedFile(selectedFile);
				setSelectedFile(null);
				setIsLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setIsLoading(false);
			});
	};

	const BrowseFile = () => {
		document.getElementById("fileSelector").click();
	};

	const OnFileChange = (e) => {
		setSelectedFile(e.target.files[0]);
	};

	const DownloadFile = (file, fileUrl) => {
		const link = document.createElement("a");
		link.href = fileUrl;
		link.setAttribute("download", `${file.name}`);
		document.body.appendChild(link);
		link.click();
	};

	return (
		<PageContainer>
			<PageBackground />
			<Wrapper>
				<ChatDisplaySection id="chat">
					<ChatSection>
						<ChatBubbleWrapper className={"BotChat"}>
							<ChatBubbleSection className={"BotChat"}>
								<IdentifierText>{"RFPBot"}</IdentifierText>
								<ChatBubble className={"BotChat"}>
									Hi I am RFPBot, your RFP Document generation companion. I have
									been trained on data from the{" "}
									<a
										rel="noreferrer"
										target="_blank"
										style={{ color: "#3477eb" }}
										href="https://www.acquisition.gov/browse/index/far">
										Federal Acquisition Regulation
									</a>{" "}
									website to understand the context of the required document and
									collate accurate details. <br /> <br />
									All you need to do is share a Table of Contents in a excel
									sheet and I will generate a detailed RFP Document for you.
								</ChatBubble>
							</ChatBubbleSection>
						</ChatBubbleWrapper>
						{chatHistory?.map((chat, index) => (
							<>
								{chat.message !== "" && (
									<ChatBubbleWrapper
										key={index}
										className={
											chat.sender === "client" ? "ClientChat" : "BotChat"
										}>
										<ChatBubbleSection
											className={
												chat.sender === "client" ? "ClientChat" : "BotChat"
											}>
											<IdentifierText>
												{chat.sender === "client" ? "You" : "DermaBot"}
											</IdentifierText>
											<ChatBubble
												className={
													chat.sender === "client" ? "ClientChat" : "BotChat"
												}>
												{chat.message}
											</ChatBubble>
										</ChatBubbleSection>
									</ChatBubbleWrapper>
								)}
								{chat.files?.length > 0 && (
									<>
										{chat.files?.map((file, index) => (
											<ChatBubbleWrapper
												key={index}
												className={
													chat.sender === "client" ? "ClientChat" : "BotChat"
												}>
												<ChatBubbleSection
													className={
														chat.sender === "client" ? "ClientChat" : "BotChat"
													}>
													<IdentifierText>
														{chat.sender === "client" ? "You" : "PDFBot"}
													</IdentifierText>
													<ChatBubble
														className={
															chat.sender === "client"
																? "ClientChat"
																: "BotChat"
														}>
														<FileShowContainer
															onClick={() =>
																DownloadFile(file, URL.createObjectURL(file))
															}>
															<DescriptionIcon
																style={{
																	fontSize: 40,
																	color:
																		chat.sender === "client"
																			? "#1D6F42"
																			: "#CC0000",
																}}
															/>
															<UploadText className="small">
																{file?.name}
															</UploadText>
														</FileShowContainer>
													</ChatBubble>
												</ChatBubbleSection>
											</ChatBubbleWrapper>
										))}
									</>
								)}
							</>
						))}
					</ChatSection>
				</ChatDisplaySection>

				<ChatInputWrapper>
					<FileDropZone ref={drop}>
						<BrowseContainer>
							<CloudUploadIcon
								style={{ fontSize: 60, color: "#2D2D2D", marginRight: "20px" }}
							/>
							<UploadText className="large">Drag file to upload</UploadText>
							<UploadText className="small">Or</UploadText>
							<BrowseFileButton onClick={BrowseFile}>
								Browse Files
							</BrowseFileButton>
							<HiddenInput
								id="fileSelector"
								accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
								type="file"
								onChange={OnFileChange}
							/>
						</BrowseContainer>
						{selectedFile && (
							<FilePreviewContainer>
								<DescriptionIcon
									style={{
										fontSize: 40,
										color: "#1D6F42",
									}}
								/>
								<UploadText className="small">
									{selectedFile?.name}
									<br />{" "}
									<span style={{ color: "rgb(0,0,0,0.5)", fontSize: "12px" }}>
										{Math.round(selectedFile?.size / 100) / 10} KB
									</span>
								</UploadText>
							</FilePreviewContainer>
						)}
					</FileDropZone>
				</ChatInputWrapper>
				{selectedFile && (
					<UploadButtonContainer>
						{isLoading ? (
							<CircularProgress
								style={{ color: "#2D2D2D", marginBottom: "20px" }}
							/>
						) : (
							<UploadButton onClick={UploadFile}>Upload File</UploadButton>
						)}
					</UploadButtonContainer>
				)}
				<ChatInput
					placeholder="Type your message here..."
					onChange={OnMessageInputChange}
					onKeyUp={CheckSendMessage}
					value={messageValue}
					// multiline
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IconButton onClick={SendMessage}>
									<SendIcon />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			</Wrapper>
		</PageContainer>
	);
};

const PageContainer = styled("div")({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	minHeight: "100vh",
	width: "100%",
	position: "relative",
});

const PageBackground = styled("div")({
	position: "absolute",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	backgroundImage: "url(/PwC_Geom_02.png)",
	backgroundSize: "cover",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "center",
	filter: "contrast(0.75)",
	zIndex: 0,
});

const Wrapper = styled("div")({
	position: "absolute",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	zIndex: 2,
});

const ChatDisplaySection = styled("div")({
	height: "100%",
	width: "-webkit-fill-available",
	overflowY: "auto",
	flexGrow: 1,
	margin: "20px 20px 0px 20px",
	"&::-webkit-scrollbar": {
		width: "0.75rem",
	},
	"&::-webkit-scrollbar-thumb": {
		backgroundColor: "rgba(255, 255, 255, 0.6)",
		borderRadius: "0.5rem",
	},
});

const ChatSection = styled("div")({
	display: "flex",
	flexDirection: "column",
	justifyContent: "flex-end",
	padding: "10px",
});

const ChatBubbleWrapper = styled("div")({
	width: "100%",
	display: "flex",
	"&.BotChat": {
		justifyContent: "flex-start",
	},
	"&.ClientChat": {
		justifyContent: "flex-end",
	},
});

const ChatBubbleSection = styled("div")({
	width: "50%",
	display: "flex",
	marginBottom: "10px",
	flexDirection: "column",
	border: "none",
	"&.BotChat": {
		alignItems: "flex-start",
	},
	"&.ClientChat": {
		alignItems: "flex-end",
	},
});

const IdentifierText = styled("div")({
	fontSize: "12px",
	fontWeight: 500,
	color: "#2D2D2D",
	marginBottom: "7px",
});

const ChatBubble = styled("div")({
	padding: "15px",
	fontSize: "15PX",
	zIndex: 1000,
	textAlign: "left",
	whiteSpace: "pre-wrap",
	"&.BotChat": {
		backgroundColor: "#2D2D2D",
		color: "rgb(255, 255, 255, 0.75)",
		borderRadius: "5px 20px 20px 20px",
	},
	"&.ClientChat": {
		backgroundColor: "rgb(245, 245, 245,0.8)",
		color: "#000000",
		borderRadius: "20px 5px 20px 20px",
	},
});

const FileShowContainer = styled("div")({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "5px 10px",
	borderRadius: "10px",
	backgroundColor: "rgba(255, 255, 255)",
	boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.75)",
	cursor: "pointer",
	color: "#2D2D2D",
});

const ChatInputWrapper = styled("div")({
	width: "60%",
	minHeight: "200px",
	display: "flex",
	flexDirection: "column",
	alignItems: "flex-st",
	zIndex: 2,
	padding: "10px 10px",
	margin: "50px 20px",
	backgroundColor: "rgba(255, 255, 255, 0.8)",
	borderRadius: "10px",
	borderColor: "#193718",
});

const FileDropZone = styled("div")({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	height: "100%",
	border: "3px dashed #2D2D2D",
	borderRadius: "20px",
});

const BrowseContainer = styled("div")({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "#2D2D2D",
	fontFamily: "Helvetica Neue",
});

const UploadText = styled("div")({
	fontWeight: 350,
	textAlign: "left",
	marginLeft: "10px",
	"&.large": {
		fontSize: "20px",
	},
	"&.small": {
		fontSize: "15px",
	},
});

const BrowseFileButton = styled(Button)({
	background: "#2D2D2D",
	color: "#FFFFFF",
	fontWeight: 400,
	fontSize: "15px",
	padding: "5px 20px",
	marginLeft: "20px",
	borderRadius: "30px",
	"&:hover": {
		background: "#2D2D2D",
		opacity: 0.8,
	},
});

const FilePreviewContainer = styled("div")({
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",
	marginTop: "10px",
	padding: "10px",
	backgroundColor: "rgba(0, 0, 0, 0.2)",
	boxShadow: "inset 0px 0px 10px 0px rgba(0, 0, 0, 0.2)",
	borderRadius: "10px",
});

const UploadButtonContainer = styled("div")({
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",
	width: "100%",
	marginBottom: "20px",
	marginTop: "-20px",
	height: "50px",
});

const UploadButton = styled(Button)({
	background: "#2D2D2D",
	color: "#FFFFFF",
	fontSize: "20px",
	padding: "10px 30px",
	borderRadius: "30px",
	"&:hover": {
		background: "#EB8C00",
		color: "#2D2D2D",
		opacity: 0.8,
	},
});

const HiddenInput = styled("input")({
	display: "none",
});

const ChatInput = styled(TextField)({
	resize: "none",
	marginBottom: "10px",
	width: "80%",
	borderRadius: "10px",
	fontFamily: "inherit",
	border: "none",
	backgroundColor: "rgba(255, 255, 255, 0.85)",
	"& .MuiOutlinedInput-root": {
		"& fieldset": {
			borderColor: "#FFFFFF",
		},
		"&:hover fieldset": {
			borderColor: "#FFFFFF",
		},
	},
	"& .MuiOutlinedInput-root.Mui-focused": {
		"& > fieldset": {
			borderColor: "#FFFFFF",
		},
	},
});

export default ChatSpace;
