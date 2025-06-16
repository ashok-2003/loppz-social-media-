// pages/login.tsx (or app/login/page.tsx if using app directory)
'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
} from '@heroui/card';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { title } from '@/components/primitives';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isCelebrity, setIsCelebrity] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');


    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                username: username,
                role: isCelebrity.toString(),
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else if (result?.ok) {
                router.push('/feed');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Card className="w-full">
                    <CardHeader className="flex flex-col gap-3 pb-6">
                        <div className="flex flex-col items-center text-center">
                            <p className={title({ color: "cyan" })}> Join our community</p>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <Input
                                type="text"
                                label="Username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                isRequired
                                variant="bordered"
                            />

                            <Input
                                type="email"
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isRequired
                                variant="bordered"
                            />

                            <Input
                                type="password"
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                isRequired
                                variant="bordered"
                            />

                            <div className="flex items-center justify-between py-2">
                                <Switch
                                    isSelected={isCelebrity}
                                    onValueChange={setIsCelebrity}
                                    color="primary"
                                    size="sm"
                                >
                                    <span className="text-sm font-medium text-gray-700">
                                        Celebrity Account
                                    </span>
                                </Switch>
                            </div>

                            {error && (
                                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                isLoading={isLoading}
                                className="w-full"
                            >
                                Procced
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}