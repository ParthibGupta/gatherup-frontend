import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand,
  SignUpCommand,
  AuthFlowType,
  GlobalSignOutCommand,
  GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import CryptoJS from 'crypto-js';

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID!;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID!;
const CLIENT_SECRET = import.meta.env.VITE_COGNITO_CLIENT_SECRET!;
const REGION = import.meta.env.VITE_AWS_REGION || 'ap-southeast-2';

const client = new CognitoIdentityProviderClient({ region: REGION });

const calculateSecretHash = (username: string): string => {
  const message = username + CLIENT_ID;
  const hash = CryptoJS.HmacSHA256(message, CLIENT_SECRET);
  return CryptoJS.enc.Base64.stringify(hash);
};

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
  name?: string;
}

interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    name?: string;
    profilePicture?: string;
  } | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  getHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getHeader = () => {
    if (tokens?.accessToken) {
      return { Authorization: `Bearer ${tokens.accessToken}` };
    }
    return {};
  };
  useEffect(() => {
    const loadCachedSession = async () => {
      try {
        const cachedTokens = localStorage.getItem('auth_tokens');
        if (cachedTokens) {
          const parsedTokens: AuthTokens = JSON.parse(cachedTokens);
          setTokens(parsedTokens);
          
          const command = new GetUserCommand({
            AccessToken: parsedTokens.accessToken
          });

          const response = await client.send(command);
          
          if (response.UserAttributes) {
            const userAttrs = response.UserAttributes.reduce<Record<string, string>>((acc, attr) => ({
              ...acc,
              [attr.Name]: attr.Value
            }), {});

            setUser({
              id: userAttrs.sub,
              username: userAttrs.preferred_username || userAttrs.email,
              email: userAttrs.email,
              name: userAttrs.name,
              profilePicture: userAttrs.picture
            });
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        localStorage.removeItem('auth_tokens');
        setTokens(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadCachedSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { username, password } = credentials;
      const secretHash = calculateSecretHash(username);

      const command = new InitiateAuthCommand({
        ClientId: CLIENT_ID,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          SECRET_HASH: secretHash
        }
      });

      const response = await client.send(command);

      if (response.AuthenticationResult) {
        const newTokens: AuthTokens = {
          accessToken: response.AuthenticationResult.AccessToken!,
          idToken: response.AuthenticationResult.IdToken!,
          refreshToken: response.AuthenticationResult.RefreshToken!
        };

        localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
        setTokens(newTokens);
        const user = await client.send(new GetUserCommand({
          AccessToken: newTokens.accessToken
        }));
        if(user.UserAttributes) {
          const userAttrs = user.UserAttributes.reduce<Record<string, string>>((acc, attr) => ({
            ...acc,
            [attr.Name]: attr.Value
          }), {});

          setUser({
            id: userAttrs.sub,
            username: userAttrs.preferred_username || userAttrs.email,
            email: userAttrs.email,
            name: userAttrs.name,
            profilePicture: userAttrs.picture
          });
        }
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };


  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { username, password, email, name } = credentials;
      const secretHash = calculateSecretHash(username);

      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: [
          { Name: "email", Value: email },
          ...(name ? [{ Name: "name", Value: name }] : []),
        ],
      });

      await client.send(command);
      return true;
    } catch (err) {
      setError(err.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (tokens?.accessToken) {
        const command = new GlobalSignOutCommand({
          AccessToken: tokens.accessToken
        });
        await client.send(command);
      }

      localStorage.removeItem('auth_tokens');
      setTokens(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        tokens,
        loading,
        error,
        login,
        register,
        logout,
        getHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};