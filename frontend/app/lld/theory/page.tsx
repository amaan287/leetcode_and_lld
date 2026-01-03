'use client';

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function TheoryPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push('/auth/login');
    return null;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">LLD Theory</h1>

          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction to Low-Level Design</h2>
              <p className="text-gray-700 mb-4">
                Low-Level Design (LLD) is a detailed design phase that focuses on the implementation details
                of a system. It involves designing classes, interfaces, data structures, and algorithms that
                will be used to build the system.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Principles</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>SOLID Principles:</strong> Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion</li>
                <li><strong>DRY (Don't Repeat Yourself):</strong> Avoid code duplication</li>
                <li><strong>Separation of Concerns:</strong> Each class should have a single, well-defined purpose</li>
                <li><strong>Encapsulation:</strong> Hide internal implementation details</li>
                <li><strong>Abstraction:</strong> Focus on what rather than how</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Design Patterns</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Creational Patterns</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Singleton: Ensure only one instance exists</li>
                    <li>Factory: Create objects without specifying exact classes</li>
                    <li>Builder: Construct complex objects step by step</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Structural Patterns</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Adapter: Allow incompatible interfaces to work together</li>
                    <li>Decorator: Add behavior to objects dynamically</li>
                    <li>Facade: Provide a simplified interface to a complex subsystem</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Behavioral Patterns</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Observer: Notify multiple objects about state changes</li>
                    <li>Strategy: Define a family of algorithms and make them interchangeable</li>
                    <li>Command: Encapsulate requests as objects</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Best Practices</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Start with requirements clarification</li>
                <li>Identify core entities and their relationships</li>
                <li>Design for extensibility and maintainability</li>
                <li>Consider edge cases and error handling</li>
                <li>Use appropriate data structures</li>
                <li>Write clean, readable code</li>
                <li>Think about scalability and performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Interview Questions</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Design a Parking Lot System</li>
                <li>Design a Library Management System</li>
                <li>Design a Snake and Ladder Game</li>
                <li>Design a Tic-Tac-Toe Game</li>
                <li>Design a URL Shortener</li>
                <li>Design a Cache System</li>
                <li>Design a Rate Limiter</li>
                <li>Design a Logging System</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

