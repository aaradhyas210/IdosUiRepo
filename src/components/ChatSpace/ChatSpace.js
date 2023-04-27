import React, { useEffect, useState } from "react";
import { IconButton, InputAdornment, TextField, styled } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";

const ChatSpace = () => {
	const [chatHistory, setChatHistory] = useState([]);
	const [messageValue, setMessageValue] = useState("");
	const [selectedImages, setSelectedImages] = useState([]);
	const [selectedImageUrls, setSelectedImageUrls] = useState([]);

	useEffect(() => {
		let chat = document.getElementById("chat");
		if (chat) {
			chat.scrollTop = chat?.scrollHeight;
		}
	}, [chatHistory]);

	const getChatResponse = async (value) => {
		fetch(`http://localhost:8080/api/question=${value}`)
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error("Something went wrong ...");
				}
			})
			.then((data) => {
				const chat = {
					message: data,
					sender: "bot",
					files: [],
					fileUrls: [],
				};
				setChatHistory((curr) => [...curr, chat]);
			})
			.catch((error) => console.log(error));
	};

	const onMessageInputChange = (e) => {
		setMessageValue(e.target.value);
	};

	const checkSendMessage = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			sendMessage(e.target.value);
		}
	};

	const sendMessage = (value) => {
		if (value !== "") {
			const chat = {
				message: value,
				sender: "client",
				files: selectedImages,
				fileUrls: selectedImageUrls,
			};
			setChatHistory([...chatHistory, chat]);
			setMessageValue("");
			setSelectedImages([]);
			setSelectedImageUrls([]);
			setTimeout(() => {
				getChatResponse(value);
			}, 1000);
		}
	};

	const chooseFile = () => {
		document.getElementById("fileSelector").click();
	};

	const onFileChange = (e) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			Object.values(files).forEach((element) => {
				console.log(selectedImages.includes(element));
				if (!selectedImages.includes(element)) {
					setSelectedImages((curr) => [...curr, element]);
					setSelectedImageUrls((curr) => [
						...curr,
						URL.createObjectURL(element),
					]);
				}
			});
		}
	};

	const removeFile = (index) => {
		const newSelectedImages = [...selectedImages];
		const newSelectedImageUrls = [...selectedImageUrls];
		newSelectedImages.splice(index, 1);
		newSelectedImageUrls.splice(index, 1);
		setSelectedImages(newSelectedImages);
		setSelectedImageUrls(newSelectedImageUrls);
	};

	return (
		<PageContainer>
			<PageBackground />
			<Overlay />
			<Wrapper>
				<ChatDisplaySection id="chat">
					<ChatSection>
						{chatHistory?.map((chat, index) => (
							<>
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
								{chat.fileUrls?.length > 0 && (
									<>
										{chat.fileUrls?.map((image, index) => (
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
															chat.sender === "client"
																? "ClientChat"
																: "BotChat"
														}>
														<ChatImage src={image} />
													</ChatBubble>
												</ChatBubbleSection>
											</ChatBubbleWrapper>
										))}
									</>
								)}
							</>
						))}

						<ChatBubbleWrapper className={"BotChat"}>
							<ChatBubbleSection className={"BotChat"}>
								<IdentifierText>{"DermaBot"}</IdentifierText>
								<ChatBubble className={"BotChat"}>
									Lorem Ipsum is simply dummy text of the printing and
									typesetting industry. Lorem Ipsum has been the industry's
									standard dummy text ever since the 1500s, when an unknown
									printer took a galley of type and scrambled it to make a type
									specimen book. It has survived not only five centuries, but
									also the leap into electronic typesetting, remaining
									essentially unchanged. It was popularised in the 1960s with
									the release of Letraset sheets containing Lorem Ipsum
									passages, and more recently with desktop publishing software
									like Aldus PageMaker including versions of Lorem Ipsum.
								</ChatBubble>
							</ChatBubbleSection>
						</ChatBubbleWrapper>
					</ChatSection>
				</ChatDisplaySection>

				<ChatInputWrapper>
					<ChatInput
						placeholder="Type your message here..."
						onChange={onMessageInputChange}
						onKeyUp={checkSendMessage}
						value={messageValue}
						multiline
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={chooseFile}>
										<AttachFileIcon />
										<HiddenInput
											multiple
											id="fileSelector"
											accept="image/*"
											type="file"
											onChange={onFileChange}
										/>
									</IconButton>
									<IconButton onClick={() => sendMessage(messageValue)}>
										<SendIcon />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					{selectedImageUrls?.length > 0 && (
						<ImagePreviewContainer>
							{selectedImageUrls.map((url, index) => (
								<ImagePreviewWrapper key={index}>
									<ImagePreview src={url} />
									<RemoveButton onClick={() => removeFile(index)}>
										<CloseIcon style={{ fontSize: "16px" }} />
									</RemoveButton>
								</ImagePreviewWrapper>
							))}
						</ImagePreviewContainer>
					)}
				</ChatInputWrapper>
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
	backgroundColor: "#102310",
	zIndex: 0,
});

const Overlay = styled("div")({
	position: "absolute",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	backgroundImage: "url(/stethoscope.png)",
	backgroundSize: "repeat",
	backgroundRepeat: "space",
	backgroundPosition: "left top",
	mixBlendMode: "overlay",
	filter: "contrast(0.35)",
	zIndex: 1,
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
	width: "60%",
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
	color: "rgba(255, 255, 255, 0.4)",
	marginBottom: "7px",
});

const ChatBubble = styled("div")({
	padding: "15px",
	fontSize: "14px",
	zIndex: 1000,
	textAlign: "left",
	whiteSpace: "pre-wrap",
	"&.BotChat": {
		backgroundColor: "rgb(32, 70, 32, 0.75)",
		color: "rgb(255, 255, 255, 0.8)",
		borderRadius: "5px 20px 20px 20px",
	},
	"&.ClientChat": {
		backgroundColor: "rgb(245, 245, 245,0.8)",
		color: "#000000",
		borderRadius: "20px 5px 20px 20px",
	},
});

const ChatImage = styled("img")({
	width: "100%",
	height: "100%",
	objectFit: "cover",
	borderRadius: "10px",
});

const ChatInputWrapper = styled("div")({
	width: "-webkit-fill-available",
	display: "flex",
	flexDirection: "column",
	alignItems: "flex-st",
	zIndex: 2,
	padding: "0px 10px",
	margin: "20px 20px",
	backgroundColor: "rgba(255, 255, 255)",
	borderRadius: "10px",
	borderColor: "#193718",
});

const ChatInput = styled(TextField)({
	resize: "none",
	width: "100%",
	borderRadius: "10px",
	fontFamily: "inherit",
	border: "none",
	backgroundColor: "rgba(255, 255, 255, 0.8)",
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

const HiddenInput = styled("input")({
	display: "none",
});

const ImagePreviewContainer = styled("div")({
	display: "flex",
	flexDirection: "row",
	justifyContent: "flex-start",
	alignItems: "center",
	flexWrap: "wrap",
	width: "100%",
	marginBottom: "10px",
});

const ImagePreview = styled("img")({
	width: "100px",
	height: "100px",
	objectFit: "cover",
	borderRadius: "10px",
	position: "relative",
	marginLeft: "15px",
});

const ImagePreviewWrapper = styled("div")({
	position: "relative",
	marginTop: "10px",
});

const RemoveButton = styled(IconButton)({
	position: "absolute",
	top: -5,
	right: -5,
	color: "#000000",
	backgroundColor: "rgba(0,0,0,0.3)",
});

export default ChatSpace;
