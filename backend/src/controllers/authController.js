import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const { fullName, email, password } = req.body;

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already registered" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			fullName,
			email,
			password: hashedPassword,
		});

		return res.status(201).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			token: generateToken(user._id),
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to register user" });
	}
};

export const loginUser = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		return res.json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			token: generateToken(user._id),
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to login user" });
	}
};

export const getProfile = async (req, res) => {
	return res.json(req.user);
};
